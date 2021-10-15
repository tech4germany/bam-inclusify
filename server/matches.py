from typing import *
import sys

sys.path.insert(0, "../data")

from helpers_csv import csvs_to_dict

rules = csvs_to_dict("../data/unified")["sg"]


def matches(text: str):
    return list(map(mock_match, gender_matches(text)))


def gender_matches(text: str):
    return filter(lambda a: a != [], map(token_replacements, tokens(text)))


def tokens(text):
    return text.split(" ")


def token_replacements(token):
    if token in rules.keys():
        return rules[token]
    else:
        return []


def mock_match(replacements: List[str]):
    replacement_values = list(map(lambda a: {"value": a}, replacements))
    return {
    "message": "Evtl. passt der geschlechtsneutrale Begriff „Reinigungskraft“ besser.",
    "shortMessage": "",
    "replacements": replacement_values,
    "offset": 13,
    "length": 8,
    "context": {
        "text": "Ich bin eine Putzfrau.",
        "offset": 13,
        "length": 8,
    },
    "sentence": "Ich bin eine Putzfrau.",
    "type": {"typeName": "Hint"},
    "rule": {
        "id": "PUTZFRAU",
        "subId": "1",
        "sourceFile": "grammar.xml",
        "description": "'Reinigungskraft' statt 'Putzfrau'",
        "issueType": "style",
        "category": {
            "id": "GENERISCHES_MASKULINUM",
            "name": "Geschlechtergerechte Sprache",
        },
        "isPremium": False,
    },
    "ignoreForIncompleteSentence": False,
    "contextForSureMatch": 0,
}
