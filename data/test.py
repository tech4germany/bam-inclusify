from os import path
from typing import *
import subprocess
import requests


def test_basic():
    # dereko
    assert_suggestions("Risikopatient", [["Risikopatient*in"]])
    # geschicktgendern:
    assert_suggestions("Besucherstrom", [["Publikumsstrom"]])
    assert_suggestions("Expertengruppe", [["Fachgruppe"]])
    # openthesaurus
    # assert_suggestions("Tierkörperbeseitiger", [[]]) # TODO alternatives still have to be added
    # vienna catalog
    assert_suggestions(
        "anwenderfreundlich",
        [["anwendungsfreundlich", "einfach anzuwenden", "praxisnah"]],
    )


def test_mixed():
    # dereko + geschicktgendern + vienna catalog
    assert_suggestions("Regisseur", [["Regisseur*in", "Regie"]])
    # dereko + geschicktgendern
    assert_suggestions("Doktoranden", [["Doktorand*innen", "Promovierende"]])


def test_basic_with_flexion():
    pass


def test_words_not_recognized_by_morphological_dictionary():
    # Some words like "Beamter" seem not to be recognized by the morphological dictionary.
    # We want to make sure that the rules work at least for the basic form.
    return
    assert_suggestions("Beamten", [["Beamt*innen", "Beamten*innen"]])
    assert_suggestions(
        "Beamter",
        [["Verbeamtete Person", "Person im Beamtenstatus"]],
    )
    assert_suggestions("Beamte", [["Bedienstete", "Beamtenschaft"]])


def test_words_with_singular():
    # words where there are singular and plural versions, but we only want to match singular
    assert_suggestions(
        "Ehegatte",
        [
            [
                "Die Ehe teilende Person",
                "Ehemensch",
                "Eheherzperson",
                "Herzmensch",
            ]
        ],
    )
    # openthesaurus
    assert_suggestions("Adoptivsohn", [[]])


def test_words_with_plural():
    # words where there are singular and plural versions, but we only want to match plural
    # assert_suggestions("Ehegatten", [["Eheleute", "Ehepaar"]]) # even this is ambiguous
    # openthesaurus
    assert_suggestions("Adoptivsöhne", [[]])


def test_words_with_ambiguous_number():
    # Should show both singular and plural suggestions witin a single rule
    return
    assert_suggestions(
        "Arbeiter",
        [
            [
                "Arbeitskraft",
                "Erwerbstätige",
                "Belegschaft",
                "Beschäftigte",
                "Arbeitskräfte",
            ]
        ],
    )


def test_words_without_recognized_number():
    assert_suggestions("Abbrecherquote", [["Abbruchquote"]])


def test_words_without_number():
    return
    # some words contained do not have a number
    assert_suggestions("Not am Mann", "Notsituation")


def assert_suggestions(input, expected, language_code="de-DE-x-diversity-star"):
    print("Please ensure that the LanguageTool server is running.")
    matches = requests.post(
        url="http://localhost:8081/v2/check",
        data={"language": language_code, "text": input},
    ).json()["matches"]
    suggestions = [[rep["value"] for rep in match["replacements"]] for match in matches]
    assert suggestions == expected


if __name__ == "__main__":
    test()
