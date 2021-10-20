from copy import copy
from helpers import open_, add_to_dict
from os import path
from typing import *
import csv
import itertools
import re
import stanza
import subprocess

# stanza.download("de")

nlp = stanza.Pipeline(lang="de", processors="tokenize,mwt,pos,lemma,depparse")


def unified_list():
    files = [
        ("dereko", "dereko/dereko_unified_checked.csv"),
        ("geschicktgendern", "geschicktgendern/geschicktgendern_normalized.csv"),
        # "vienna_catalog/vienna_catalog.csv",
    ]
    dic = {}
    for name, file in files:
        rules = list(csv.reader(open_(file)))
        for lemma, rules in lemmatize_rules(rules, name).items():
            add_to_dict(lemma, rules, dic)
    rows = []
    for lemma, rules in dic.items():
        for y in rules:
            (insensitive_lemmas, insensitive, sensitive, plural_only, source) = y
            rows.append([lemma, insensitive_lemmas, insensitive, sensitive, plural_only, source])
    csv.writer(open("unified.csv", "w")).writerows(rows)


def lemmatize_rules(rules, source):
    # save the lemma of the root of the insensitive part of each rule for easy matching
    lemmatized_rules = {}
    for [insensitive, sensitive, plural_only] in rules:
        doc = nlp(insensitive)
        insensitive_lemmas = ";".join(list(itertools.chain(*[[word.lemma for word in sentence.words] for sentence in nlp(insensitive).sentences])))
        for sentence in doc.sentences:
            for word in sentence.words:
                if word.head == 0:
                    add_to_dict(
                        word.lemma, [(insensitive_lemmas, insensitive, sensitive, plural_only, source)], lemmatized_rules)
    return lemmatized_rules


if __name__ == "__main__":
    unified_list()
