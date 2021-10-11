import itertools
import sys
sys.path.insert(0, "..")
from helpers import open_
from create_xml import rule_to_xml

illness_replacements = [
    ["Schizophrener", ["Schizophrenie"]],
    ["Schizophreniker", ["Schizophrenie"]],
    ["Mongoloide", ["Trisomie 21"]],
    ["Mongo", ["Trisomie 21"]],
    ["Psychotiker", ["Psychose"]],
    ["Alkoholiker", ["Alkoholproblem"]],
    ["Dyslexiker", ["Dyslexie"]],
    ["Epileptiker", ["Epilepsie"]],
    ["Paraplegiker", ["Paraplegie"]],
    ["Quadriplegiker", ["Quadriplegie"]],
    ["Spastiker", ["zerebrale Lähmung", "Zerebralparese"]],
    ["Spast", ["zerebrale Lähmung", "Zerebralparese"]],
    ["Wasserkopf", ["Hydrocephalus"]],
    ["Narkoleptiker", ["Narkolepsie"]],
]


def short_message(pattern):
    return "Beziehe dich in erster Linie auf den Menschen, nicht die Krankheit, Behinderung, Sucht etc."


message = "TODO"


def create_illness_rules():
    rules = []
    for ill_person, illnesses in illness_replacements:
        for number in ["sg", "pl"]:
            rules.append(
                rule_to_xml(
                    ill_person,
                    "sg",
                    ["Person mit {}".format(illness) for illness in illnesses],
                    message=message,
                    short_message=short_message,
                )
            )
        for number in ["both", "unknown"]:
            rules.append(
                rule_to_xml(
                    ill_person,
                    "both",
                    list(
                        itertools.chain(
                            *[
                                [
                                    "Person mit {}".format(illness),
                                    "Menschen mit {}".format(illness),
                                ]
                                for illness in illnesses
                            ]
                        )
                    ),
                    message=message,
                    short_message=short_message,
                )
            )
    return "\n".join(rules)
