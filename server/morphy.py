# A wrapper around Morphy, the morphological lexicon used by LanguageTool.
# There seem to be no other approaches to inflection readily available for German.
# See `LICENSE`.

import re
import sys

sys.path.insert(0, "../data")

from helpers import add_to_dict, open_, log

dump = open_("dictionary.dump").readlines()

inflected_to_lemma = {}
lemma_to_inflected = {}


def init():
    print("Reading morphological dictionary ...")
    for line in dump:
        inflected, lemma, morph = line.split("\t")
        add_to_dict(inflected, [(morph, lemma)], inflected_to_lemma)
        add_to_dict(lemma, [(morph, inflected)], lemma_to_inflected)


def inflect(word, case=None, gender=None, number=None):
    if word not in inflected_to_lemma:
        return None
    meanings = inflected_to_lemma[word]
    inflected = []
    for morph, lemma in meanings:
        morphs = parse_morph(morph)
        if not morphs:
            print(word, "is not a noun or adjective.")
            return None
        case = case if case is not None else morphs["Case"]
        gender = gender if gender is not None else morphs["Gender"]
        number = number if number is not None else morphs["Number"]
        new_morph = ":".join([morphs["POS"], case, number, gender])
        inflected += [inflected_ for morph_, inflected_ in lemma_to_inflected[lemma]
                      if re.match(new_morph, morph_) is not None]
    return list(set(inflected))


def parse_morph(morph):
    morphs = morph.split(":")
    pos = morphs[0]
    if pos == "SUB" or pos == "ADJ":
        return {
            "POS": morphs[0],
            "Case": morphs[1],
            "Number": morphs[2],
            "Gender": morphs[3],
        }
    else:
        return None


init()
