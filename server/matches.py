from typing import *
import stanza
import sys

sys.path.insert(0, "../data")

from helpers_csv import csvs_to_dict

rules = csvs_to_dict("../data/unified")["sg"]

stanza.download("de")

nlp = stanza.Pipeline(lang="de", processors="tokenize,mwt,pos,lemma")


def matches(text: str):
    doc = nlp(text)
    return gender_matches(doc)


def gender_matches(doc):
    matches = []
    for sentence in doc.sentences:
        for word in sentence.words:
            lemma = word.lemma
            if lemma in rules.keys():
                match = gender_match(
                    lemma,
                    rules[lemma],
                    word.start_char,
                    word.end_char - word.start_char,
                )
                matches.append(match)
    return matches


def gender_match(text: str, replacements: List[str], offset: int, length: int):
    replacement_values = list(map(lambda a: {"value": a}, replacements))
    return {
        "message": message,
        "shortMessage": short_message.format(text),
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


short_message = 'Die Bezeichnung "{}" spricht nur männliche Leser an. Versuche alle Menschen anzusprechen.'

message = "Der Stern wird in den letzten Jahren zunehmend verwendet. Besonders häufig findet man das Sternchen im Kontexten, in denen aufgrund aktuelle Transgender- und Intersexualitätsdebatten nicht von lediglich zwei Geschlechtern ausgegangen wird, Geschlecht also nicht mehr als ein binäre System verstanden wird. Mit dem Sternchen soll bewusst irritiert und die Möglichkeit weitere Kategorien angedeutet werden."
