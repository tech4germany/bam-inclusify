from helpers import open_
from os import path
from typing import *
import csv


def unified_list():
    files = [
        ("dereko", "dereko/dereko_unified_checked.csv"),
        ("geschicktgendern", "geschicktgendern/geschicktgendern_normalized.csv"),
        # "vienna_catalog/vienna_catalog.csv",
    ]
    rows = []
    for name, file in files:
        rules = list(csv.reader(open_(file)))
        rows += [(a, b, c, name) for a, b, c in rules]
    csv.writer(open_("unified.csv", "w")).writerows(sorted(rows))


if __name__ == "__main__":
    unified_list()
