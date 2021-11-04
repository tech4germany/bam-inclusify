from inclusify_server.helpers import add_to_dict, open_
from os import path
from tqdm import tqdm
from typing import Dict, Tuple, List, Set, cast
import csv
import inclusify_server.download_language_models
import itertools
import stanza

# This type should better be a TypedDict
UnprocessedRule = Tuple[str, str, str, str]

# This type should better be a TypedDict
ProcessedRule = Tuple[str, str, str, str, str, str]


# This type should better be a TypedDict
ProcessedRuleWithoutLemma = Tuple[str, str, str, bool, str]


def preprocess_rules() -> None:
    """
    Checks the `inclusify_server/data/suggestions_editable.csv` file for changes, and when there are changes, it transfers them to `suggestions_processed.csv`. For new rules, the lemmas of the words in the rule are retrieved via Stanza, for faster matching when the app is running.
    The current approach how this is done, with an `.old` file is not optimal and should be completely rewritten. Ideally, the order of rows within `suggestions_editable.csv` should be transfered to `suggestions_processed.csv`, so that the admins can use the order of suggestions for prioritizing them.
    """
    print("Looking for rule changes in `inclusify_server/data/suggestions_editable.csv`.")
    rules = read_rule_file("suggestions_editable.csv")
    old_rules = read_rule_file("suggestions_editable.csv.old")
    processed_rules = cast(List[ProcessedRule], list(
        csv.reader(open_(path.join("data", "suggestions_processed.csv"))))
    )
    print("Removing old rules ...")
    for insensitive, sensitive, plural_only, source in tqdm(
        old_rules.difference(rules)
    ):
        for i, (_, _, insensitive_, sensitive_, plural_only_, source_) in enumerate(
            processed_rules
        ):
            if (
                insensitive == insensitive_
                and sensitive == sensitive_
                and plural_only == plural_only_
                and source == source_
            ):
                del processed_rules[i]
    print("Processing new rules ...")
    new_rules = rules.difference(old_rules)
    if len(new_rules) > 0:
        nlp = stanza.Pipeline(lang="de", processors="tokenize,mwt,pos,lemma")
        for rule in tqdm(new_rules):
            processed_rules += lemmatize_rule(rule, nlp)

    csv.writer(open_(path.join("data", "suggestions_editable.csv.old"), "w")).writerows(
        list(rules)
    )
    csv.writer(open_(path.join("data", "suggestions_processed.csv"), "w")).writerows(
        processed_rules
    )
    print("Rule changes have been processed.")


def lemmatize_rule(rule: UnprocessedRule, nlp) -> List[ProcessedRule]:
    """
    Computes the lemma of the root and the other words of the insensitive part of each rule for easy matching, and adds them to the rule. A list is returned to simulate a nullable type, this could be changed.
    """
    (insensitive, sensitive, plural_only, source) = rule
    doc = nlp(insensitive)
    insensitive_lemmas = ";".join(
        list(
            itertools.chain(
                *[
                    [word.lemma for word in sentence.words]
                    for sentence in nlp(insensitive).sentences
                ]
            )
        )
    )
    for sentence in doc.sentences:
        for word in sentence.words:
            if word.head == 0:
                return [
                    (
                        word.lemma,
                        insensitive_lemmas,
                        insensitive,
                        sensitive,
                        plural_only,
                        source,
                    )
                ]
    print("Rule could not be lemmatized:", rule)
    return []


def read_rule_file(x) -> Set[UnprocessedRule]:
    """
    Helper for reading the specific CSV file.
    """
    return set(
        [(a, b, c, d)
         for [a, b, c, d] in csv.reader(open_(path.join("data", x)))]
    )


def load_rules() -> Dict[str, List[ProcessedRuleWithoutLemma]]:
    """
    Loads the processed rules from suggestions_processed.csv.
    """
    preprocess_rules()
    dic: Dict[str, List[ProcessedRuleWithoutLemma]] = {}
    for [
        lemma,
        insensitive_lemmas,
        insensitive,
        sensitive,
        plural_only,
        source,
    ] in csv.reader(open_(path.join("data", "suggestions_processed.csv"))):
        add_to_dict(
            lemma,
            [(insensitive_lemmas, insensitive, sensitive,
              string2bool(plural_only), source)],
            dic,
        )
    return dic


def string2bool(a: str) -> bool:
    return True if a == "1" else False
