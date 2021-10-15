from helpers import add_to_dict
from typing import *
import csv
import re

plural_marker = "(plural only) "


def dict_to_csvs(dic: Dict[str, Dict[str, List[str]]], name: str) -> None:
    rows = []
    for n in ["sg", "pl"]:
        for key, values in dic[n].items():
            for value in values:
                plural_only = 0
                if n == "pl":
                    if key in dic["sg"].keys() and value in dic["sg"][key]:
                        continue
                    else:
                        plural_only = 1
                rows += [[key, value, plural_only]]
    file = open(name + ".csv", "w")
    csv.writer(file).writerows(sorted(rows))


def csvs_to_dict(
    name: str, numbers: List[str] = ["sg", "pl"]
) -> Dict[str, Dict[str, List[str]]]:
    file = open(name + ".csv")
    dic = {"sg": {}, "pl": {}}
    for [key, val, plural_only] in csv.reader(file):
        if plural_only == '0':
            add_to_dict(key, [val], dic["sg"])
        add_to_dict(key, [val], dic["pl"])
    return dic
