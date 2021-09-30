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
languagetool_path = path.join("..", "languagetool", "languagetool")
# path of the German grammar files within the LanguageTool release
grammar_path = path.join(languagetool_path, "org", "languagetool", "rules", "de")
# file name of the additional grammar rules
rulefile = "grammar_open_minded.xml"

open_ = functools.partial(open, encoding="utf-8")


def init_languages(languages: List[Tuple[str, str]]) -> None:
    clone_repo()
    for language in languages:
        copy_folder(language)
    register(languages)
    # build_with_docker()


def clone_repo() -> None:
    dir = path.join("..", "languagetool")
    if not path.exists(path.join(dir, "languagetool")):
        subprocess.run(
            [
                "git",
                "clone",
                "git@github.com:languagetool-org/languagetool.git",
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
        languagetool_path, "languagetool-language-modules", code
    )
    if path.exists(languages_folder):
        print("Language folder for {} already exists.".format(code))
    else:
        shutil.copytree(
            path.join(
                languagetool_path,
                "languagetool-language-modules",
                "de-DE-x-simple-language",
            ),
            languages_folder,
        )

        #
        pom = open_(path.join(languages_folder, "pom.xml")).read()
        pom = re.sub(
            r"<artifactId>language-de-DE-x-simple-language</artifactId>",
            "<artifactId>{}</artifactId>".format(code),
            pom,
        )
        pom = re.sub(
            r"<name>Simple German module for LanguageTool</name>",
            "<name>{} module for LanguageTool</name>".format(name),
            pom,
        )
        open_(path.join(languages_folder, "pom.xml"), "w").write(pom)

        #
        java_folder = path.join(
            languages_folder, "src", "main", "java", "org", "languagetool", "language"
        )
        new_file = path.join(java_folder, "{}.java".format(name_))
        os.rename(
            path.join(java_folder, "SimpleGerman.java"),
            new_file,
        )
        java_file = open_(new_file).read()
        java_file = re.sub("SimpleGerman", "GenderedGerman", java_file)
        open_(new_file, "w").write(java_file)

        #
        properties_file = path.join(
            languages_folder,
            "src",
            "main",
            "resources",
            "META-INF",
            "org",
            "languagetool",
            "language-module.properties",
        )
        properties = open_(properties_file).read()
        properties = re.sub("SimpleGerman", name_, properties)
        open_(properties_file, "w").write(properties)

        #
        code = language[0]
        name = language[1]
        file = path.join(
            languagetool_path,
            "languagetool-core",
            "src",
            "main",
            "resources",
            "org",
            "languagetool",
            "MessagesBundle.properties",
        )
        properties = open_(file).read()
        properties = properties + "{} = {}\n".format(code, name)
        open_(file, "w").write(properties)


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
                code
            )
            for code, name in languages
        ]
        pom = re.sub(
            "</dependencies>",
            "{}\n\t</dependencies>".format("".join(new_dependencies)),
            pom,
        )
        return pom

    update_with_backup(
        update_language_pom,
        path.join(languagetool_path, "languagetool-language-modules", "all", "pom.xml"),
    )

    #
    def update_general_pom(pom):
        new_modules = [
            "  <module>languagetool-language-modules/{}</module>\n  ".format(code)
            for code, name in languages
        ]
        return re.sub(
            "</modules>",
            "{}</modules>".format("".join(new_modules)),
            pom,
        )

    update_with_backup(update_general_pom, path.join(languagetool_path, "pom.xml"))


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


def copy_files() -> None:
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
            '<category id="DIVERSITY_SENSITIVE_LANGUAGE" name="Erweiterung für diversitätssensible Sprache">\n&UserRules;\n</category>\n</rules>',
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


if __name__ == "__main__":
    # init_languages([("dg1", "GenderGerman"), ("dg2", "GenderGermanium")])
    build_with_docker()()
    # copy_files()
