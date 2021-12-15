from copy import deepcopy
from os import path
from typing import *
import functools

A = TypeVar("A")
B = TypeVar("B")


def log(a: str, x: A) -> A:
    # Helper function for functionally logging things.
    print(a, x)
    return x


def add_to_dict(key: A, vals: List[B], dic: Dict[A, List[B]]) -> None:
    key = deepcopy(key)
    vals = deepcopy(vals)
    if key in dic.keys():
        for val in vals:
            if not val in dic[key]:
                dic[key].append(val)
    else:
        dic[key] = vals
    return


def add_to_dict_fast(key, vals, dic):
    """
    Puts keys and values into the dict _by reference_, which may be undesired sometimes.
    """
    if key in dic:
        entry = dic[key]
        for val in vals:
            if not val in entry:
                entry.append(val)
    else:
        dic[key] = vals
    return


def open_(path_, *args):
    return open(path.join(path.dirname(__file__), path_), encoding="utf-8", *args)
