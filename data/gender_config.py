import re
from typing import *


def gender_with_neutral_words_only(suggestions_: List[str]) -> List[str]:
    return [s for s in suggestions_ if re.findall(r"und|bzw|\*", s) == []]


def gender_with_double_notation(suggestions_: List[str]) -> List[str]:
    return [s for s in suggestions_ if re.findall(r"\*", s) == []]


def gender_with_internal_i(suggestions_: List[str]) -> List[str]:
    return [
        re.sub(r"\*in", "In", s)
        for s in suggestions_
        if re.findall(r"und|bzw", s) == []
    ]


def gender_with_symbol(symbol: str) -> Callable[[List[str]], str]:
    def f(suggestions_):
        return [
            re.sub(r"\*", symbol, s)
            for s in suggestions_
            if re.findall(r"und|bzw", s) == []
        ]

    return f


gender_with_star: Callable[[List[str]], str] = gender_with_symbol("*")
gender_with_colon: Callable[[List[str]], str] = gender_with_symbol(":")
gender_with_underscore: Callable[[List[str]], str] = gender_with_symbol("_")
gender_with_slash: Callable[[List[str]], str] = gender_with_symbol("/")
gender_with_interpunct: Callable[[List[str]], str] = gender_with_symbol("·")

gender_languages = [
    ("diversity", "German diversity-sensitive", gender_with_neutral_words_only),
    (
        "diversity-double",
        "German diversity-sensitive with gender double notation",
        gender_with_double_notation,
    ),
    (
        "diversity-internal-i",
        "German diversity-sensitive with internal I notation",
        gender_with_internal_i,
    ),
    (
        "diversity-star",
        "German diversity-sensitive with star notation",
        gender_with_star,
    ),
    (
        "diversity-colon",
        "German diversity-sensitive with colon notation",
        gender_with_colon,
    ),
    (
        "diversity-underscore",
        "German diversity-sensitive with underscore notation",
        gender_with_underscore,
    ),
    (
        "diversity-slash",
        "German diversity-sensitive with slash notation",
        gender_with_slash,
    ),
    (
        "diversity-interpunct",
        "German diversity-sensitive with interpunct notation",
        gender_with_interpunct,
    ),
]

prefix = "de-DE-x-"  # prefix for gender language name codes
