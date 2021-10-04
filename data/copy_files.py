#!/usr/bin/python
# -*- coding: utf-8 -*-
from os import path
from pathlib import Path
from typing import *
import functools
import os
import re
import shutil
import subprocess

# adjust this to the folder of the LanguageTool release
languagetool_path = path.join("..", "languagetool", "LanguageTool-5.4")
# path of the German grammar files within the LanguageTool release
grammar_path = path.join(languagetool_path, "org", "languagetool", "rules", "de")
# file name of the additional grammar rules
rulefile = "grammar_openminded.xml"
compiled_path = path.join(
    languagetool_path,
    "languagetool-standalone",
    "target",
    "LanguageTool-5.5-SNAPSHOT",
    "LanguageTool-5.5-SNAPSHOT",
    "org",
    "languagetool",
    "rules",
)

prefix = "de-DE-x-"

open_ = functools.partial(open, encoding="utf-8")


def init_languages(languages: List[Tuple[str, str]]) -> None:
    clone_repo()
    for language in languages:
        copy_folder(language)
    register(languages)
    # build_with_docker()
    # for language in languages:
    #     copy_grammars(path.join(compiled_path, prefix + language[0]))


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
            for code, name in languages
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
            for code, name in languages
        ]
        return re.sub(
            "</modules>",
            "{}</modules>".format("".join(new_modules)),
            pom,
        )

    update_with_backup(update_general_pom, path.join(languagetool_path, "pom.xml"))

    def add_names(file):
        return file + "\n".join(
            ["{} = {}".format(prefix + code, name) for code, name in languages]
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


def copy_files(grammar_path=grammar_path) -> None:
    xml = open_(rulefile).read()
    open_(path.join(grammar_path, rulefile), "w").write(xml)

    def update_rulefile(old_xml):
        new_xml = old_xml.replace(
            "<!DOCTYPE rules [",
            '<!DOCTYPE rules [ \n\t<!ENTITY UserRules SYSTEM "file:///{}">'.format(
                path.abspath(path.join(grammar_path, rulefile))
            ),
        ).replace(
            "</rules>",
            '<category id="GENERISCHES MASKULINUM" name="Generisches Maskulinum">\n&UserRules;\n</category>\n</rules>',
        )
        return new_xml

    update_with_backup(update_rulefile, path.join(grammar_path, "grammar.xml"))


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


if __name__ == "__main__":
    # init_languages([("dg1", "Gender German 1"), ("dg2", "Gender German 2")])
    copy_files(grammar_path)
