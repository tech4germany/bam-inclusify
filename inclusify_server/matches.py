from compound_split import char_split
from copy import deepcopy
from functools import lru_cache
from inclusify_server.helpers import add_to_dict, log, open_
from inclusify_server.morphy.morphy import inflect
from inclusify_server.prepare_list import load_rules
from typing import *
from stanza.models.common.doc import Word
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

rules = load_rules()


def matches(text: str):
    doc = tokenize(text)
    matches_ = []
    for sentence in doc.sentences:
        for match in gender_matches(sentence.text):
            match_ = deepcopy(match)
            match_["offset"] += sentence.words[0].parent.start_char
            matches_.append(match_)
    return matches_


# @lru_cache(maxsize=1000)
def gender_matches(sentence_text):
    sentence = nlp(sentence_text).sentences[0]
    return list(
        it.chain(
            *[
                matches_of_word(word, sentence)
                for word in fix_gender_symbols(sentence.words)
            ]
        )
    )


def matches_of_word(word, sentence, recursion=0):
    lemma = word.lemma
    good_alternatives = []
    if lemma in rules:
        for rule in rules[lemma]:
            if is_applicable(rule, word, sentence):
                _, _, good, plural_only, source = rule
                good_alternatives.append((good, plural_only, source))
        good_alternatives = [
            (simplify_participles(good, word), plural_only, source)
            for good, plural_only, source in good_alternatives
        ]
        good_alternatives = list(
            it.chain(
                *[
                    inflect_root(word, alt, plural_only, source)
                    for alt, plural_only, source in good_alternatives
                ]
            )
        )
        good_alternatives = [
            alt for alt in good_alternatives if word.text != alt]
    if len(good_alternatives) < 5 and recursion <= 0:
        split = char_split.split_compound(word.lemma)[0]
        if split:
            probability, part1, part2 = split
            if probability > 0.7:
                part2 = startupper(part2) if word.text.isupper() else part2
                word_ = deepcopy(word)
                word_.lemma = part2
                word_.text = part2
                sentence_ = deepcopy(sentence)
                sentence_.words = [
                    word_ if w.id == word.id else w for w in sentence_.words
                ]
                for match in matches_of_word(word_, sentence_, recursion + 1):
                    replacements = [
                        part1 + r["value"].lower()
                        for r in match["replacements"]
                        if len(r["value"].split(" ")) == 1
                    ]
                    good_alternatives += replacements
    if len(good_alternatives) > 0:
        return [gender_match(
            word.text,
            good_alternatives,
            word.start_char,
            word.end_char - word.start_char,
        )]
    else:
        return []


def gender_match(text: str, replacements: List[str], offset: int, length: int):
    replacement_values = list(map(lambda a: {"value": a}, replacements))
    return {
        "message": MESSAGE,
        "shortMessage": SHORT_MESSAGE.format(text),
        "replacements": replacement_values,
        "offset": offset,
        "length": length,
        "context": {
            "text": text,
            "offset": offset,
            "length": length,
        },
        "rule": {
            "category": {
                "id": "GENERISCHES_MASKULINUM",
                "name": "Generisches Maskulinum",
            },
        },
    }


SHORT_MESSAGE = 'Die Bezeichnung "{}" spricht nur männliche Leser an. Versuche alle Menschen anzusprechen.'

MESSAGE = "Der Stern wird in den letzten Jahren zunehmend verwendet. Besonders häufig findet man das Sternchen im Kontexten, in denen aufgrund aktuelle Transgender- und Intersexualitätsdebatten nicht von lediglich zwei Geschlechtern ausgegangen wird, Geschlecht also nicht mehr als ein binäre System verstanden wird. Mit dem Sternchen soll bewusst irritiert und die Möglichkeit weitere Kategorien angedeutet werden."


def is_applicable(rule, word, sentence):
    # check if all lemmas from the rule are in the sentence
    bad_lemmas_, _, _, plural_only, _ = rule
    bad_lemmas = bad_lemmas_.split(";")
    sentence_lemmas = [word.lemma for word in sentence.words]
    if any([lemma not in sentence_lemmas for lemma in bad_lemmas]):
        return False
    if parse_feats(word.feats)["Number"] == "SIN" and plural_only:
        return False
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


def back(a, b):
    return a + b - 1


def forth(a, b):
    return a - b - 1


def parse_feats(feats):
    # Returns dict with keys "Case" (e.g. "NOM"), "Gender" (e.g. "FEM"), "Number" (e.g. "SIN")
    pairs = []
    for pair in feats.split("|"):
        key, val = pair.split("=")
        val = val[:3].upper()
        pairs.append((key, val))
    return dict(pairs)


def inflect_root(bad_word, alternative, plural_only, source):
    morphs = parse_feats(bad_word.feats)
    sentence = nlp(alternative).sentences[0]
    good_root = [word for word in sentence.words if word.deprel == "root"][0]
    if (
        bad_word.pos != good_root.pos
        and not (bad_word.pos == "PROPN" and good_root.pos == "NOUN")
        and not (bad_word.pos == "NOUN" and good_root.pos == "PROPN")
    ):
        return []
    if "Gender" not in morphs:
        # The word will not be corrected because its grammatical gender is neutral.
        # Perhaps it should still be corrected (it could contain a prefix that is not neutral.)
        return []
    number_ = None if plural_only else morphs["Number"]
    inflected_good_roots = inflect(
        good_root.text, case=morphs["Case"], number=number_
    ) or [
        good_root.text
    ]  # + " (not inflected)"]
    alternatives_with_inflected_root = []
    for inflected_good_root in inflected_good_roots:
        root_id = [
            i
            for i, t in enumerate(sentence.tokens)
            if good_root.id in [w.id for w in t.words]
        ][0]
        tokens = [t.text for t in sentence.tokens]
        for inflected_root_with_gender_symbol in add_gender_symbol(
            source, bad_word.text, inflected_good_root
        ):
            alternatives_with_inflected_root.append(
                " ".join(
                    [
                        *tokens[:root_id],
                        inflected_root_with_gender_symbol,
                        *tokens[root_id + 1:],
                    ]
                )
            )
    return alternatives_with_inflected_root


def simplify_participles(good_words, bad_root):
    match = re.match(
        r"(^[a-zäöüß]+(ige|ene|te|nde)n?) (Person|Mensch|Firma)$", good_words
    )
    if parse_feats(bad_root.feats)["Number"] == "PLU" and match:
        return startupper(match[1])
    else:
        return good_words


def startupper(a):
    if a == "":
        return ""
    return a[0].upper() + a[1:]


def add_gender_symbol(source, bad_word, inflected_good_root):
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
    # The tokenizer does not always deal correctly with gender symbols.
    # Here we try to fix this.
    # A better approach would be to deal with it before it is processed by Stanza.
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
