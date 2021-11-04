from compound_split import char_split
from os import path
from typing import List, Dict, Optional
from typing_extensions import TypedDict
import klepto
import os
import re
import sys
from inclusify_server.helpers import add_to_dict, open_, log

print("Loading morphological dictionary ...")
cwd = os.path.dirname(os.path.realpath(__file__))
lemma_to_inflected = klepto.archives.file_archive(
    path.join(cwd, "lemma_to_inflected"), {}
)
lemma_to_inflected.load()
inflected_to_lemma = klepto.archives.file_archive(
    path.join(cwd, "inflected_to_lemma"), {}
)
inflected_to_lemma.load()
print("Done loading morphological dictionary.")


def init():
    print("Converting morphological dictionary ...")
    for filename in ["dictionary_added.txt", "dictionary.dump"]:
        for line in tqdm(open_(filename).readlines()):
            inflected, lemma, morph = line.split("\t")
            add_to_dict(inflected, [(morph, lemma)], inflected_to_lemma)
            add_to_dict(lemma, [(morph, inflected)], lemma_to_inflected)
    inflected_to_lemma.dump()
    lemma_to_inflected.dump()


def inflect(
    word: str,
    case: str = None,
    gender: str = None,
    number: str = None,
    recursion: int = 0,
) -> List[str]:
    """
    Adjust case, gender, and number of a word. The adjustment only happens in those dimensions that are specified. 
    (If you only specify the `number` parameter, then only the number will be adjusted, for example.)
    This is a wrapper around the morphological dictionary Morphy.
    See the `LICENSE` file for more information on Morphy.
    """
    inflected: List[str] = []
    if word not in inflected_to_lemma:
        # Words ending with "in" or "innen" (very common for gendered words) are not changed by inflections
        # except singular/plural changes, which we can handle manually
        if re.match(r".*in$", word) and number == "PLU":
            return [word + "nen"]
        if re.match(r".*innen$", word) and number == "SIN":
            return [re.sub(r"nen$", "", word)]
        if re.match(r".*in(nen)?$", word):
            return [word]
        if recursion > 0:
            return []
        for _, part_1, part_2 in char_split.split_compound(word)[:3]:
            inflected_part_2s = inflect(
                part_2, case=case, gender=gender, number=number, recursion=recursion + 1
            )
            for inflected_part_2 in inflected_part_2s:
                inflected.append(part_1 + inflected_part_2.lower())
        return list(set(inflected))
    meanings = inflected_to_lemma[word]
    for morph, lemma in meanings:
        morphs = parse_morph(morph)
        if not morphs:
            print(word, "is not a noun or adjective.")
            return []
        case = case if case is not None else morphs["Case"]
        gender = gender if gender is not None else morphs["Gender"]
        number = number if number is not None else morphs["Number"]
        new_morph = ":".join([morphs["POS"], case, number, gender])
        inflected += [
            inflected_
            for morph_, inflected_ in lemma_to_inflected[lemma]
            if re.match(new_morph, morph_) is not None
        ]
    return list(set(inflected))


Morph = TypedDict(
    "Morph",
    {
        "POS": str,
        "Case": str,
        "Number": str,
        "Gender": str,
    },
)


def parse_morph(morph: str) -> Optional[Morph]:
    """
    Parse the features in Morphy in a way that is consistent with the way how we parse the features created by Stanza. See influsify_server.matches.parse_feats.
    """
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
