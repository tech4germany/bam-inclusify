from compound_split import char_split
from copy import deepcopy
from functools import lru_cache
from inclusify_server.helpers import add_to_dict, log, open_
from inclusify_server.morphy.morphy import inflect
from inclusify_server.prepare_list import load_rules, ProcessedRuleWithoutLemma
from typing import List, Dict, Tuple, cast
from typing_extensions import TypedDict
from stanza.models.common.doc import Word, Sentence
import csv
import inclusify_server.download_language_models
import itertools as it
import re
import stanza
import sys

print("Loading language models ...")
tokenize = stanza.Pipeline(lang="de", processors="tokenize")
nlp = stanza.Pipeline(lang="de", processors="tokenize,mwt,pos,lemma,depparse")
print("Language models loaded.")

Rule = ProcessedRuleWithoutLemma

rules: Dict[str, List[Rule]] = load_rules()

Context = TypedDict(
    "Context",
    {
        "text": str,
        "offset": int,
        "length": int,
    },
)

Category = TypedDict(
    "Category",
    {
        "id": str,
        "name": str,
    },
)

Rule_ = TypedDict("Rule_", {"category": Category})

Replacement = TypedDict("Replacement", {"value": str})

Match = TypedDict(
    "Match",
    {
        "message": str,
        "shortMessage": str,
        "replacements": List[Replacement],
        "offset": int,
        "length": int,
        "context": Context,
        "rule": Rule_,
    },
)


def matches(text: str) -> List[Match]:
    """
    Returns the rule matches (including information about the rule and the replacements) for a given text.
    This function may be called many times in a row for a text with only minor changes, because currently the frontend triggers a re-check whenever a replacement is accepted. Therefore, we partition the text into sentences with a cheap NLP model that only performs tokenization, and for each sentence we call a cached function. The more expensive NLP methods will thus only be triggered for sentences where the text has changed.
    """
    doc = tokenize(text)
    matches_ = []
    for sentence in doc.sentences:
        for match in matches_per_sentence(sentence.text):
            match_ = deepcopy(match)
            match_["offset"] += sentence.words[0].parent.start_char
            matches_.append(match_)
    return matches_


@lru_cache(maxsize=1000)
def matches_per_sentence(sentence_text: str) -> List[Match]:
    """
    Collects the rule matches for each single word in the sentence and returns the combined results.
    A rule is always triggered by a single word (the root word of the insensitive phrase), thus this also deals with phrases consisting of multiple words.
    """
    sentence = nlp(sentence_text).sentences[0]
    return list(
        it.chain(
            *[
                matches_per_word(word, sentence)
                for word in fix_gender_symbols(sentence.words)
            ]
        )
    )


def matches_per_word(word: Word, sentence: Sentence, recursion=0) -> List[Match]:
    """
    Returns matches triggered by the word. The context is also considered, so multi-word rules also work.
    @param recursion: How deep should we should search for subwords.
    """
    suggestions: List[str] = []
    if word.lemma in rules:
        # Find applicable rules and retrieve raw suggestions
        suggestions_0: List[Tuple[str, int, str]] = []
        for rule in rules[word.lemma]:
            rule = cast(Rule, rule)
            if is_applicable(rule, word, sentence):
                _, _, good, category_id, source = rule
                suggestions_0.append((good, category_id, source))
        # Simplify the suggestions in some cases
        suggestions_1 = [
            (simplify_participles(good, word), category_id, source)
            for good, category_id, source in suggestions_0
        ]
        # Inflect the suggestions to match the replaced word in case and number
        suggestions_2 = list(
            it.chain(
                *[
                    inflect_root(word, alt, category_id, source)
                    for alt, category_id, source in suggestions_1
                ]
            )
        )
        # Remove suggestions that don't change anything
        suggestions = [alt for alt in suggestions_2 if word.text != alt]
    # Try subwordsplitting when there are not many results:
    if len(suggestions) < 5 and recursion <= 0:
        split = char_split.split_compound(word.lemma)[0]
        if split:
            probability, part1, part2 = split
            # It's not an actual probability, it can be lower than 0 and higher than 1
            if probability > 0.7:
                # Split the word, recursively find matches for the second part of the word
                part2 = startupper(part2) if word.text.isupper() else part2
                word_ = deepcopy(word)
                word_.lemma = nlp(part2).sentences[0].words[0].lemma
                word_.text = part2
                sentence_ = deepcopy(sentence)
                sentence_.words = [
                    word_ if w.id == word.id else w for w in sentence_.words
                ]
                # Adjust the results to also include the first part of the word
                for match in matches_per_word(word_, sentence_, recursion + 1):
                    replacements = [
                        part1 + r["value"].lower()
                        for r in match["replacements"]
                        if len(r["value"].split(" ")) == 1
                    ]
                    suggestions += replacements
    # Only return a match when there are some suggestions:
    if len(suggestions) > 0:
        return [
            gender_match(
                word.text,
                suggestions,
                word.start_char,
                word.end_char - word.start_char,
            )
        ]
    else:
        return []


def gender_match(text: str, replacements: List[str], offset: int, length: int) -> Match:
    """
    Takes the raw information about a match and returns the suitable format for the API.
    """
    replacement_values: List[Replacement] = list(
        map(lambda a: {"value": a}, replacements)
    )
    return {
        "message": MESSAGE,
        "shortMessage": SHORT_MESSAGE.format(text),
        "replacements": replacement_values,
        "offset": offset,
        "length": length,
        "context": {
            "text": text,
            "offset": 0,
            "length": len(text),
        },
        "rule": {
            "category": {
                "id": "GENERISCHES_MASKULINUM",
                "name": "Generisches Maskulinum",
            },
        },
    }


SHORT_MESSAGE = 'Die Bezeichnung "{}" spricht nur männliche Leser an. Versuche alle Menschen anzusprechen.'

MESSAGE = "Es gibt verschiedene Ansätze für eine geschlechtergerechte Ausdrucksweise. Oft wird die Verwendung neutraler Begriffe bevorzugt. Darüber hinaus findet man auch oft Gendersymbole. Das Sternchen zum Beispiel insbesondere im Kontext der aktuellen Transgender- und Intersexualitätsdebatten: mit dem Sternchen sind mehr als zwei Geschlechter angesprochen."


def is_applicable(rule: Rule, word: Word, sentence: Sentence) -> bool:
    """
    Returns whether a rule is applicable given a word (the potential root of the insensitive phrase) and the sentence around the word.
    In the future, this should check whether the same dependency tree (with the same lemmas and the same connections between them) which is present in the rule is also present in the sentence. Right now, it just checks whether the root is the same and whether the other lemmas are also in the sentence. For the simple rules that we use for gendering, this is practically sufficient.
    """
    # Check if all lemmas from the rule are in the sentence
    bad_lemmas_, _, _, category_id, _ = rule
    bad_lemmas = bad_lemmas_.split(";")
    sentence_lemmas = [word.lemma for word in sentence.words]
    if any([lemma not in sentence_lemmas for lemma in bad_lemmas]):
        return False
    # If the root is singular but the rule is only applicable in plural
    # Cf. the documentation on rule lists
    if parse_feats(word.feats)["Number"] == "SIN" and category_id == 2:
        return False
    # When the word is part of a double notation phrase with the female form of the same word, the rule has already been applied and is thus no longer applicable

    def back(a, b):
        return a + b - 1

    def forth(a, b):
        return a - b - 1

    for f in [back, forth]:
        if f(word.id, 2) >= 0 and f(word.id, 2) < len(sentence.words):
            if sentence.words[f(word.id, 1)].text in ["und", "oder"]:
                length = (
                    min(len(word.text), len(
                        sentence.words[f(word.id, 2)].text)) - 3
                )
                if word.text[:length] == sentence.words[f(word.id, 2)].text[:length]:
                    feats = parse_feats(sentence.words[f(word.id, 2)].feats)
                    if "Gender" in feats and feats["Gender"] == "FEM":
                        return False
    return True


def parse_feats(feats):
    """
    Helper function for dealing with the feature values that Stanza returns.
    They look like "Case=Nom|Gender=Fem|Number=Sing" and we convert it to a dictionary with keys "Case" (e.g. "NOM"), "Gender" (e.g. "FEM"), "Number" (e.g. "SIN"). We capitalize the values and make them 3 characters long for compatibility with the notation that is used in Morphy.
    """
    # Returns
    pairs = []
    for pair in feats.split("|"):
        key, val = pair.split("=")
        val = val[:3].upper()
        pairs.append((key, val))
    return dict(pairs)


def inflect_root(
    root_of_bad_phrase: Word, suggestion: str, category_id: int, source: str
):
    """
    Adjusts the case (nominative, ...) and number (singular/plural) of the suggestion to those of the insensitive word.
    Currently we only do it for the root. We should also do it for all the words that depend on the root. (Specifically, those words that congruent to the root in case and number, that is, articles, personal pronouns, relative pronouns, etc.)
    Uses the morphological dictionary Morphy for that purpose (see morphy.py). Morphy does not consistently include different forms for nouns with definite article and nouns with indefinite article ("die Bediensteten" vs "Bedienstete"), so we do not take care of it either. In the future, we should find a workaround here (maybe it's always the suffix "e" vs "en"?), and then also take care of whether there is a definite or indefinite article.
    """
    morphs = parse_feats(root_of_bad_phrase.feats)
    sentence = nlp(suggestion).sentences[0]
    root_of_suggestion = [
        word for word in sentence.words if word.deprel == "root"][0]
    if (
        root_of_bad_phrase.pos != root_of_suggestion.pos
        and not (root_of_bad_phrase.pos == "PROPN" and root_of_suggestion.pos == "NOUN")
        and not (root_of_bad_phrase.pos == "NOUN" and root_of_suggestion.pos == "PROPN")
    ):
        return []
    if "Gender" not in morphs:
        # The word will not be corrected because its grammatical gender is neutral.
        # Perhaps it should still be corrected (it could contain a prefix that is not neutral.)
        return []
    # For plural only rules, we do not adjust the number:
    number_ = None if category_id == 2 else morphs["Number"]
    # Try to inflect, otherwise use the uninflected word.
    # There can be mutiple matching forms in Morphy (albeit very rarely), so there can be multiple inflected versions of just one suggestion.
    inflected_roots_of_suggestions = inflect(
        root_of_suggestion.text, case=morphs["Case"], number=number_
    ) or [root_of_suggestion.text]
    suggestions_with_inflected_roots = []
    for inflected_good_root in inflected_roots_of_suggestions:
        id_of_root_word = [
            i
            for i, t in enumerate(sentence.tokens)
            if root_of_suggestion.id in [w.id for w in t.words]
        ][0]
        tokens = [t.text for t in sentence.tokens]
        # For words that should be gendered with a symbol or with double notation, we only have the female form in the rule list. This is good, because we can inflect it easily as long as there are no symbols. After the inflection, it is now time to add the gender symbols, or the double notation:
        for inflected_root_with_gender_symbol in add_gender_symbol(
            source, root_of_bad_phrase.text, inflected_good_root
        ):
            # For each inflected root, we assemble the other words around it. Here, we should also inflect dependent words, but currently we don't.
            suggestions_with_inflected_roots.append(
                " ".join(
                    [
                        *tokens[:id_of_root_word],
                        inflected_root_with_gender_symbol,
                        *tokens[id_of_root_word + 1:],
                    ]
                )
            )
    return suggestions_with_inflected_roots


def simplify_participles(phrase: str, root_of_bad_phrase: Word):
    """
    Simplify phrases like "bewerbende Personen" to "Bewerbende".
    """
    match = re.match(
        r"(^[a-zäöüß]+(ige|ene|te|nde)n?) (Person|Mensch|Firma)$", phrase)
    if parse_feats(root_of_bad_phrase.feats)["Number"] == "PLU" and match:
        return startupper(match[1])
    else:
        return phrase


def startupper(a):
    if a == "":
        return ""
    return a[0].upper() + a[1:]


def add_gender_symbol(source, bad_word, inflected_good_root):
    """
    Adds a gender symbol or double notation to a phrase.
    """
    if not source == "dereko":
        return [inflected_good_root]
    elif source == "dereko":
        connector = "und" if re.match(
            r".*innen$", inflected_good_root) else "oder"
        return [
            re.sub(r"(in(nen)?)$", r"*\1", inflected_good_root),
            "{} {} {}".format(inflected_good_root, connector, bad_word),
        ]


def fix_gender_symbols(words):
    """
    The tokenizer does not always deal correctly with gender symbols.
    Here we try to fix this. (We first thought it be very simple that way.)
    But a much better approach would be to remove the symbols before the processing through Stanza, and add them back afterwards. That way, Stanza would just see the gendered forms as female forms and would not be confused at all.
    """
    fixed_words = []
    for i, word in enumerate(words):
        if (
            word.id > 0
            and re.match(r"^[*:_·/]-?in(nen)?$", word.text)
            and words[i - 1].upos == "NOUN"
        ):
            prev = words[i - 1]
            number = "Plur" if re.match(r"innen$", word.text) else "Sing"
            new_prev = Word(
                {
                    "id": prev.id,
                    "text": prev.text + word.text,
                    "lemma": prev.lemma + word.lemma,
                    "upos": prev.upos,
                    "xpos": prev.xpos,
                    "feats": "Case={}|Gender=Fem|Number={}".format(
                        parse_feats(prev.feats)["Case"], number
                    ),
                    "head": prev.head,
                    "deprel": prev.deprel,
                    "start_char": prev.start_char,
                    "end_char": word.end_char,
                }
            )
            fixed_words[-1] = new_prev
        elif (
            word.id > 1
            and re.match(r"^in(nen)?$", word.text)
            and re.match(r"^[*:_·/]$", words[i - 1].text)
            and words[i - 2].upos == "NOUN"
        ):
            prev = words[i - 1]
            preprev = words[i - 2]
            number = "Plur" if re.match(r"innen$", word.text) else "Sing"
            new_prev = Word(
                {
                    "id": preprev.id,
                    "text": preprev.text + prev.text + word.text,
                    "lemma": preprev.lemma + prev.lemma + word.lemma,
                    "upos": preprev.upos,
                    "xpos": preprev.xpos,
                    "feats": "Case={}|Gender=Fem|Number={}".format(
                        parse_feats(preprev.feats)["Case"], number
                    ),
                    "head": preprev.head,
                    "deprel": preprev.deprel,
                    "start_char": preprev.start_char,
                    "end_char": word.end_char,
                }
            )
            fixed_words[-2] = new_prev
            del fixed_words[-1]
        else:
            fixed_words.append(word)
    return fixed_words
