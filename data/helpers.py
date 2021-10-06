from copy import copy
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
    key = copy(key)
    vals = copy(vals)
    if key in dic.keys():
        for val in vals:
            if not val in dic[key]:
                dic[key].append(val)
    else:
        dic[key] = vals





def update_with_backup(fun, file_path) -> None:
    if path.isfile(file_path + ".old"):
        file = open_(file_path + ".old").read()
    else:
        file = open_(file_path).read()
        open_(file_path + ".old", "w").write(file)
    new_file = fun(file)
    open_(file_path, "w").write(new_file)


def update(fun, file_path) -> None:
    file = open_(file_path).read()
    new_file = fun(file)
    open_(file_path, "w").write(new_file)


open_ = functools.partial(open, encoding="utf-8")
