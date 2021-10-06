from os import path
from pathlib import Path
from typing import *
import functools
import os
import re
import shutil
import subprocess
import sys

sys.path.insert(0, "../..")
from xmlify import *

# path of the German grammar files within the LanguageTool release
grammar_path = path.join("org", "languagetool", "rules", "de")

languagetool_path = path.join("..", "languagetool", "languagetool")

languagetool_version = "5.6-SNAPSHOT"

languagetool_build_path = path.join(
    languagetool_path,
    "languagetool-standalone",
    "target",
    "LanguageTool-" + languagetool_version,
    "LanguageTool-" + languagetool_version,
)

prefix = "de-DE-x-"

open_ = functools.partial(open, encoding="utf-8")


def unified_dic() -> Dict[str, Dict[str, List[str]]]:
    unified_dic: Dict[str, Dict[str, List[str]]] = {"sg": {}, "pl": {}, "combined": {}}

    files = {
        "dereko/dereko_unified": ["sg", "pl"],
        "geschicktgendern/geschicktgendern": ["sg", "pl"],
        "openthesaurus/openthesaurus_persons_male": ["sg", "pl"],
        "vienna_catalog/vienna_catalog": ["sg", "pl"],
    }
    dic = {}

    for file, numbers in files.items():
        dic[file] = csvs_to_dict(file, numbers=numbers)
        for n in numbers:
            print(file, n, len(dic[file][n]))
            for key, vals in dic[file][n].items():
                add_to_dict(key, vals, unified_dic[n])
                add_to_dict(key, vals, unified_dic["combined"])

    return unified_dic


def make_xml() -> None:
    custom_xml = open(
        path.join("retext-equality", "custom_rules_disability.xml")
    ).read()
    unified_dic_ = unified_dic()
    for code, _, genderfun in gender_languages:
        xml = custom_xml
        xml += '<category id="GENERISCHES_MASKULINUM" name="Generisches Maskulinum">'
        for key, val in unified_dic_["combined"].items():
            for number in ["sg", "pl"]:
                if key in unified_dic_[number].keys():
                    xml += rule_to_xml(
                        key, number, unified_dic_[number][key], genderfun
                    )
            for number in ["both", "unknown"]:
                xml += rule_to_xml(key, number, val, genderfun)
        xml += "</category>"
        open("grammar_{}.xml".format(code), "w").write(xml)


def check_xml() -> None:
    result = subprocess.run(
        ["./testrules.sh", "de"], cwd=languagetool_path, capture_output=True
    )
    stdout = result.stdout.decode("UTF-8")
    stderr = result.stderr.decode("UTF-8")
    open("rule_validation_stdout.log", "w").write(stdout)
    open("rule_validation_stderr.log", "w").write(stderr)


def start_languagetool():
    subprocess.run(
        ["java", "-jar", "languagetool.jar"],
        cwd=languagetool_build_path,
    )


def init_languages(languages: List[Tuple[str, str]]) -> None:
    clone_repo()
    for language in languages:
        copy_folder(language)
    register(languages)
    build_with_docker()


def clone_repo() -> None:
    dir = path.join("..", "languagetool")
    if not path.exists(path.join(dir, "languagetool")):
        subprocess.run(
            [
                "git",
                "clone",
                "https://github.com/languagetool-org/languagetool.git",
                "--depth",
                "1",
            ],
            cwd=dir,
        )


def copy_folder(language: Tuple[str, str]) -> None:
    code = language[0]
    name = language[1]
    name_ = re.sub(r"\W", "", name)
    languages_folder = path.join(
        languagetool_path, "languagetool-language-modules", prefix + code
    )
    if path.exists(languages_folder):
        print("Language folder for {} already exists.".format(prefix + code))
    else:

        def replace_placeholders(file):
            file = re.sub("Language Name", name, file)
            file = re.sub("LanguageName", name_, file)
            file = re.sub("language-code", code, file)
            file = re.sub("languagetool-version", languagetool_version, file)
            return file

        shutil.copytree(
            path.join("language-template", "language-code"),
            languages_folder,
        )

        for file in [
            path.join(languages_folder, "pom.xml"),
            path.join(languages_folder, ".project"),
            path.join(
                languages_folder,
                "src",
                "main",
                "java",
                "org",
                "languagetool",
                "language",
                "LanguageName.java",
            ),
            path.join(
                languages_folder,
                "src",
                "main",
                "resources",
                "META-INF",
                "org",
                "languagetool",
                "language-module.properties",
            ),
        ]:
            update(replace_placeholders, file)

        os.rename(
            path.join(
                languages_folder,
                "src",
                "main",
                "java",
                "org",
                "languagetool",
                "language",
                "LanguageName.java",
            ),
            path.join(
                languages_folder,
                "src",
                "main",
                "java",
                "org",
                "languagetool",
                "language",
                name_ + ".java",
            ),
        )
        shutil.move(
            path.join(
                languages_folder,
                "src",
                "main",
                "resources",
                "org",
                "languagetool",
                "rules",
                "de-DE-x-language-code",
            ),
            path.join(
                languages_folder,
                "src",
                "main",
                "resources",
                "org",
                "languagetool",
                "rules",
                prefix + code,
            ),
        )


def register(languages: List[Tuple[str, str]]) -> None:
    #
    def update_language_pom(pom):
        new_dependencies = [
            """
        <dependency>
            <groupId>org.languagetool</groupId>
            <artifactId>language-{}</artifactId>
            <version>${{languagetool.version}}</version>
        </dependency>""".format(
                prefix + code
            )
            for code, name, _ in languages
        ]
        return re.sub(
            "</dependencies>",
            "{}\n\t</dependencies>".format("".join(new_dependencies)),
            pom,
        )

    update_with_backup(
        update_language_pom,
        path.join(languagetool_path, "languagetool-language-modules", "all", "pom.xml"),
    )

    #
    def update_general_pom(pom):
        new_modules = [
            "  <module>languagetool-language-modules/{}</module>\n  ".format(
                prefix + code
            )
            for code, name, _ in languages
        ]
        return re.sub(
            "</modules>",
            "{}</modules>".format("".join(new_modules)),
            pom,
        )

    update_with_backup(update_general_pom, path.join(languagetool_path, "pom.xml"))

    def add_names(file):
        return file + "\n".join(
            ["{} = {}".format(prefix + code, name) for code, name, _ in languages]
        )

    update_with_backup(
        add_names,
        path.join(
            languagetool_path,
            "languagetool-core",
            "src",
            "main",
            "resources",
            "org",
            "languagetool",
            "MessagesBundle.properties",
        ),
    )


def build_with_docker() -> None:
    print("Building with Docker ...")
    subprocess.run(
        "docker run -it --rm --name my-maven-project -v {}:/usr/src/mymaven -v {}/.m2:/root/.m2 -w /usr/src/mymaven maven:3.8-openjdk-8 ./build.sh languagetool-standalone package -DskipTests".format(
            path.abspath(languagetool_path), Path.home()
        ).split(
            " "
        ),
        cwd=languagetool_path,
    )
    # docker run -it --rm --name my-maven-project -v (pwd):/usr/src/mymaven -v $HOME/.m2:/root/.m2 -w /usr/src/mymaven maven:3.8-openjdk-8 ./build.sh languagetool-standalone package -DskipTests


def copy_files_multiple_languages() -> None:
    for code, _, _ in gender_languages:
        grammar_path = path.join("org", "languagetool", "rules", prefix + code)
        rulefile = "grammar_{}.xml".format(code)
        xml = open_(rulefile).read()
        open_(path.join(languagetool_build_path, grammar_path, rulefile), "w").write(
            xml
        )

        def update_rulefile(old_xml):
            new_xml = old_xml.replace(
                "<!DOCTYPE rules [",
                '<!DOCTYPE rules [ \n\t<!ENTITY UserRules SYSTEM "file:{}">'.format(
                    path.join(".", grammar_path, rulefile)
                ),
            ).replace(
                "</rules>",
                "\n&UserRules;\n</rules>",
            )
            return new_xml

        update_with_backup(
            update_rulefile,
            path.join(languagetool_build_path, grammar_path, "grammar.xml"),
        )


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


def neutral(suggestions_):
    return [s for s in suggestions_ if re.findall(r"und|bzw|\*", s) == []]


def double_notation(suggestions_):
    return [s for s in suggestions_ if re.findall(r"\*", s) == []]


def internal_i(suggestions_):
    return [
        re.sub(r"\*in", "In", s)
        for s in suggestions_
        if re.findall(r"und|bzw", s) == []
    ]


def gender_with_symbol(symbol):
    def f(suggestions_):
        return [
            re.sub(r"\*", symbol, s)
            for s in suggestions_
            if re.findall(r"und|bzw", s) == []
        ]

    return f


star = gender_with_symbol("*")
colon = gender_with_symbol(":")
underscore = gender_with_symbol(":")
slash = gender_with_symbol("/")
interpunct = gender_with_symbol("·")

gender_languages = [
    ("diversity", "German diversity-sensitive", neutral),
    (
        "diversity-double",
        "German diversity-sensitive with gender double notation",
        double_notation,
    ),
    (
        "diversity-internal-i",
        "German diversity-sensitive with internal I notation",
        internal_i,
    ),
    ("diversity-star", "German diversity-sensitive with star notation", star),
    ("diversity-colon", "German diversity-sensitive with colon notation", colon),
    (
        "diversity-underscore",
        "German diversity-sensitive with underscore notation",
        underscore,
    ),
    ("diversity-slash", "German diversity-sensitive with slash notation", slash),
    (
        "diversity-interpunct",
        "German diversity-sensitive with interpunct notation",
        interpunct,
    ),
]


if __name__ == "__main__":
    # init_languages(gender_languages)
    # make_xml()
    # copy_files(grammar_path)
    # copy_files_multiple_languages()
    start_languagetool()
    pass
