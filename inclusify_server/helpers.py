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


def add_to_dict(key: A, vals: List[B], dic: Dict[A, List[B]]) -> Dict[A, List[B]]:
    key = deepcopy(key)
    vals = deepcopy(vals)
    if key in dic.keys():
        for val in vals:
            if not val in dic[key]:
                dic[key].append(val)
    else:
        dic[key] = vals


def open_(*args):
    return open(path.join(path.dirname(__file__), *args), encoding="utf-8")
