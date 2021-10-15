from typing import *
import sys

sys.path.insert(0, "../data")

from helpers_csv import csvs_to_dict

rules = csvs_to_dict("../data/unified")["sg"]


def matches(text: str):
    return [mock_match(t, gender_matches(t)) for t in tokens(text)]


def gender_matches(text: str):
    return filter(lambda a: a != [], map(token_replacements, tokens(text)))


def tokens(text):
    return text.split(" ")


def token_replacements(token):
    if token in rules.keys():
        return rules[token]
    else:
        return []


def mock_match(text: str, replacements: List[str]):
    replacement_values = list(map(lambda a: {"value": a}, replacements))
    return {
        "message": message,
        "shortMessage": short_message.format(text),
        "replacements": replacement_values,
        "offset": 13,
        "length": 8,
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
