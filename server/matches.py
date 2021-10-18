from typing import *
import csv
import itertools
import stanza
import sys

sys.path.insert(0, "../data")

from helpers import add_to_dict

# stanza.download("de")

nlp = stanza.Pipeline(lang="de", processors="tokenize,mwt,pos,lemma,depparse")


def load_rules():
    dic = {}
    for [lemma, insensitive_lemmas, insensitive, sensitive, plural_only] in csv.reader(open("../data/unified.csv")):
        add_to_dict(
            lemma, [(insensitive_lemmas, insensitive, sensitive, plural_only)], dic)
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
                        _, _, sensitive, _ = rule
                        sensitive_alternatives.append(sensitive)
                if len(sensitive_alternatives) > 0:
                    match = gender_match(
                        lemma,
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
    insensitive_lemmas_, sensitive, insensitive, plural_only = rule
    insensitive_lemmas = insensitive_lemmas_.split(";")
    sentence_lemmas = [word.lemma for word in sentence.words]
    if any([lemma not in sentence_lemmas for lemma in insensitive_lemmas]):
        return False
    if parse_feats(word.feats)["Number"] == 'Sing' and plural_only == "1":
        return False
    return True


def parse_feats(feats):
    # Returns dict with keys "Case" (e.g. "Nom"), "Gender" (e.g. "Fem"), "Number" (e.g. "Sing")
    pairs = []
    for pair in feats.split("|"):
        key, val = pair.split("=")
        val = val[:3].upper()
        pairs.append((key, val))
    return dict(pairs)
