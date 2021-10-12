from copy import copy
from create_xml import rule_to_xml
from gender_config import gender_languages
from helpers import add_to_dict, open_
from helpers_csv import csvs_to_dict, dict_to_csvs
from os import path
from paths import *
import re
import subprocess
import sys
from typing import *
sys.path.insert(0, "retext-equality")
from create_illness_rules import create_illness_rules


def create_grammars() -> None:
    for code, _, genderfun in gender_languages:
        xml = ""
        xml += '<category id="GENERISCHES_MASKULINUM" name="Generisches Maskulinum">'
        xml += open_(path.join("custom_rules", "disability.xml")).read()
        xml += create_illness_rules()
        xml += "</category>"
        unified_dic_ = csvs_to_dict("unified")
        xml += '<category id="GENERISCHES_MASKULINUM" name="Generisches Maskulinum">'
        for number in ["sg", "pl"]:
            for key in unified_dic_[number].keys():
                xml += rule_to_xml(
                    key, number, unified_dic_[number][key], genderfun
                )
        for number in ["both", "unknown"]:
            combined_keys = set(unified_dic_["sg"].keys()).union(unified_dic_["pl"].keys())
            for key in combined_keys:
                vals = []
                if key in unified_dic_["sg"].keys():
                    vals += unified_dic_["sg"][key]
                if key in unified_dic_["pl"].keys():
                    vals += unified_dic_["pl"][key]
                vals = list(set(vals))
                xml += rule_to_xml(key, number, vals, genderfun)
        xml += "</category>"
        open_(path.join("grammars", "grammar_{}.xml".format(code)), "w").write(xml)


def check_xml() -> None:
    result = subprocess.run(
        ["./testrules.sh", "de"], cwd=languagetool_path, capture_output=True
    )
    stdout = result.stdout.decode("UTF-8")
    stderr = result.stderr.decode("UTF-8")
    open_("rule_validation_stdout.log", "w").write(stdout)
    open_("rule_validation_stderr.log", "w").write(stderr)

if __name__ == "__main__":
    create_grammars()
