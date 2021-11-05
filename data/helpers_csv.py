from helpers import add_to_dict
from typing import *
import csv
import re


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


def csvs_to_list(
    name: str, numbers: List[str] = ["sg", "pl"]
) -> List:
    return list(csv.reader(open(name + ".csv")))
