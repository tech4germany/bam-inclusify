from inclusify_server.helpers import add_to_dict, log, open_
from inclusify_server.download_language_models import nlp
from inclusify_server.morphy.morphy import inflect
from typing import *
import csv
import itertools
import re
import sys


def load_rules():
    dic = {}
    for [
        lemma,
        insensitive_lemmas,
        insensitive,
        sensitive,
        plural_only,
        source,
    ] in csv.reader(open_("data", "unified.csv")):
        plural_only = True if plural_only == "1" else False
        add_to_dict(
            lemma,
            [(insensitive_lemmas, insensitive, sensitive, plural_only, source)],
            dic,
        )
    return dic


rules = load_rules()


def matches(text: str):
    doc = nlp(text)
    return gender_matches(doc)


def gender_matches(doc):
    matches = []
    for sentence in doc.sentences:
        for word in sentence.words:
            lemma = word.lemma
            if lemma in rules:
                sensitive_alternatives = []
                for rule in rules[lemma]:
                    if is_applicable(rule, word, sentence):
                        _, _, sensitive, plural_only, source = rule
                        sensitive_alternatives.append((sensitive, plural_only, source))
                if len(sensitive_alternatives) > 0:
                    sensitive_alternatives = [
                        (simplify_participles(sensitive, word), plural_only, source)
                        for sensitive, plural_only, source in sensitive_alternatives
                    ]
                    sensitive_alternatives = list(
                        itertools.chain(
                            *[
                                inflect_root(word, alt, plural_only, source)
                                for alt, plural_only, source in sensitive_alternatives
                            ]
                        )
                    )
                    match = gender_match(
                        word.text,
                        sensitive_alternatives,
                        word.start_char,
                        word.end_char - word.start_char,
                    )
                    matches.append(match)
    return matches


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

MESSAGE = "Der Stern wird in den letzten Jahren zunehmend verwendet. Besonders häufig findet man das Sternchen im Kontexten, in denen aufgrund aktuelle Transgender- und Intersexualitätsdebatten nicht von lediglich zwei Geschlechtern ausgegangen wird, Geschlecht also nicht mehr als ein binäre System verstanden wird. Mit dem Sternchen soll bewusst irritiert und die Möglichkeit weitere Kategorien angedeutet werden."


def is_applicable(rule, word, sentence):
    # check if all lemmas from the rule are in the sentence
    insensitive_lemmas_, _, _, plural_only, _ = rule
    insensitive_lemmas = insensitive_lemmas_.split(";")
    sentence_lemmas = [word.lemma for word in sentence.words]
    if any([lemma not in sentence_lemmas for lemma in insensitive_lemmas]):
        return False
    if parse_feats(word.feats)["Number"] == "SIN" and plural_only:
        return False
    return True


def parse_feats(feats):
    # Returns dict with keys "Case" (e.g. "NOM"), "Gender" (e.g. "FEM"), "Number" (e.g. "SIN")
    pairs = []
    for pair in feats.split("|"):
        key, val = pair.split("=")
        val = val[:3].upper()
        pairs.append((key, val))
    return dict(pairs)


def inflect_root(insensitive_word, alternative, plural_only, source):
    morphs = parse_feats(insensitive_word.feats)
    sentence = nlp(alternative).sentences[0]
    sensitive_root = [word for word in sentence.words if word.deprel == "root"][0]
    number_ = None if plural_only else morphs["Number"]
    inflected_sensitive_roots = inflect(
        sensitive_root.text, case=morphs["Case"], number=number_
    ) or [
        sensitive_root.text
    ]  # + " (not inflected)"]
    alternatives_with_inflected_root = []
    for inflected_sensitive_root in inflected_sensitive_roots:
        makes_sense, inflected_sensitive_root = add_gender_symbol(
            source, insensitive_word.text, inflected_sensitive_root
        )
        if makes_sense:
            root_id = [
                i
                for i, t in enumerate(sentence.tokens)
                if sensitive_root.id in [w.id for w in t.words]
            ][0]
            tokens = [t.text for t in sentence.tokens]
            alternatives_with_inflected_root.append(
                " ".join(
                    [
                        *tokens[:root_id],
                        inflected_sensitive_root,  # morphs["Case"], morphs["Number"], insensitive_word.lemma
                        *tokens[root_id + 1 :],
                    ]
                )
            )
    return alternatives_with_inflected_root


def simplify_participles(sensitive_words, insensitive_root):
    match = re.match(
        r"(^[a-zäöüß]+(ige|ene|te|nde)n?) (Person|Mensch|Firma)$", sensitive_words
    )
    if parse_feats(insensitive_root.feats)["Number"] == "PLU" and match:
        return startupper(match[1])
    else:
        return sensitive_words


def startupper(a):
    if a == "":
        return ""
    return a[0].upper() + a[1:]


def add_gender_symbol(source, insensitive_word, inflected_sensitive_root):
    # returns whether it is "clean" to add a gender symbol (not yet implemented; always True)
    # and the word with the inserted gender symbol
    if not source == "dereko":
        return True, inflected_sensitive_root
    elif source == "dereko":
        return True, re.sub(r"(in(nen)?)$", r"*\1", inflected_sensitive_root)
