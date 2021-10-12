from copy import copy
from helpers import open_, add_to_dict
from helpers_csv import dict_to_csvs, csvs_to_dict
from os import path
from paths import *
from typing import *
import re
import subprocess

def unified_dic() -> Dict[str, Dict[str, List[str]]]:
    unified_dic: Dict[str, Dict[str, List[str]]] = {
        "sg": {}, "pl": {}, "combined": {}}

    files = {
        "dereko/dereko_unified": ["sg", "pl"],
        "geschicktgendern/geschicktgendern": ["sg", "pl"],
        "openthesaurus/openthesaurus_persons_male": ["sg", "pl"],
        "vienna_catalog/vienna_catalog": ["sg", "pl"],
    }
    dic = {}

    for file, numbers in files.items():
        dic[file] = csvs_to_dict(file, numbers=numbers)
        for n in numbers:
            replacements = base_form_variations(dic[file][n].keys())
            dic[file][n] = replace_keys(replacements, dic[file][n])
            print(file, n, len(dic[file][n]))
            for key, vals in dic[file][n].items():
                add_to_dict(key, vals, unified_dic[n])
                add_to_dict(key, vals, unified_dic["combined"])
    return unified_dic

def base_form_variations(inflected_forms: List[str]) -> List[Tuple[str, str]]:
    open_(path.join(languagetool_build_path, "input.txt"), "w").write(" ".join(inflected_forms))
    result = subprocess.run(
        "java -jar languagetool-commandline.jar --taggeronly --language de-DE input.txt".split(" "), cwd=languagetool_build_path, capture_output=True
    )
    stdout = result.stdout.decode("UTF-8")
    stderr = result.stderr.decode("UTF-8")
    all_base_forms = re.findall(r"([A-ZÄÖÜa-zäöüß\-]+)\[([A-ZÄÖÜa-zäöüß\-]+)", stdout)
    without_base_form = re.findall(r"([A-ZÄÖÜa-zäöüß\-]+)\[([A-ZÄÖÜa-zäöüß\-]+)/null", stdout)
    return [(a, b) for a, b in all_base_forms if a != b]

def replace_keys(replacements: List[Tuple[str, str]], dic: Dict[str, List[str]]) -> Dict[str, List[str]]:
    for a, b in replacements:
        if a in dic.keys():
            if b in dic.keys():
                dic[b] = list(set(dic[a] + copy(dic[b])))
            else:
                dic[b] = dic[a]
            del dic[a]
        else:
            pass
            # key consisting of multiple words TODO
    return dic



if __name__ == "__main__":
    dict_to_csvs(unified_dic(), "unified")