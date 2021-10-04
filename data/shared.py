from copy import copy
from typing import *
import pandas as pd

A = TypeVar("A")
B = TypeVar("B")


def log(a: str, x: A) -> A:
    # Helper function for functionally logging things.
    print(a, x)
    return x


def add_to_dict(key: A, vals: List[B], dic: Dict[A, List[B]]) -> Dict[A, List[B]]:
    key = copy(key)
    vals = copy(vals)
    if key in dic.keys():
        for val in vals:
            if not val in dic[key]:
                dic[key].append(val)
    else:
        dic[key] = vals


def dict_to_csvs(dic: Dict[str, Dict[str, List[str]]], name: str) -> None:
    for n in ["any", "sg", "pl"]:
        df = pd.DataFrame.from_dict(dic[n], orient="index")
        df.to_csv("{}_{}.csv".format(name, n), header=False)


def csvs_to_dict(name: str, numbers: List[str] = ["sg", "pl"]) -> Dict[str, Dict[str, List[str]]]:
    dic: Dict[str, Dict[str, List[str]]] = {"sg": {}, "pl": {}}
    for n in numbers:
        df = pd.read_csv("{}_{}.csv".format(name, n), header=None)
        d = df.set_index(0).T.to_dict("list")
        d = dict(
            [
                (key, [val for val in vals if type(val) == str])
                for key, vals in d.items()
            ]
        )
        dic[n] = d
    return dic
