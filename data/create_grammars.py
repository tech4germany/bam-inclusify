from create_xml import rule_to_xml
from gender_config import gender_languages
from helpers import add_to_dict
from helpers_csv import csvs_to_dict, dict_to_csvs
from os import path
from paths import *
from typing import *


def unified_dic() -> Dict[str, Dict[str, List[str]]]:
    unified_dic: Dict[str, Dict[str, List[str]]] = {"sg": {}, "pl": {}, "combined": {}}

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
            print(file, n, len(dic[file][n]))
            for key, vals in dic[file][n].items():
                add_to_dict(key, vals, unified_dic[n])
                add_to_dict(key, vals, unified_dic["combined"])

    return unified_dic


def create_grammars() -> None:
    custom_xml = open(
        path.join("retext-equality", "custom_rules_disability.xml")
    ).read()
    unified_dic_ = unified_dic()
    for code, _, genderfun in gender_languages:
        xml = custom_xml
        xml += '<category id="GENERISCHES_MASKULINUM" name="Generisches Maskulinum">'
        for key, val in unified_dic_["combined"].items():
            for number in ["sg", "pl"]:
                if key in unified_dic_[number].keys():
                    xml += rule_to_xml(
                        key, number, unified_dic_[number][key], genderfun
                    )
            for number in ["both", "unknown"]:
                xml += rule_to_xml(key, number, val, genderfun)
        xml += "</category>"
        open(path.join("grammars", "grammar_{}.xml".format(code)), "w").write(xml)


def check_xml() -> None:
    result = subprocess.run(
        ["./testrules.sh", "de"], cwd=languagetool_path, capture_output=True
    )
    stdout = result.stdout.decode("UTF-8")
    stderr = result.stderr.decode("UTF-8")
    open("rule_validation_stdout.log", "w").write(stdout)
    open("rule_validation_stderr.log", "w").write(stderr)


if __name__ == "__main__":
    create_grammars()
