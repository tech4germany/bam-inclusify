from copy_grammar_files import copy_grammar_files
from gender_config import gender_languages, prefix
from helpers import update, update_with_backup
from os import path
from pathlib import Path
from paths import *
from typing import *
import os
import re
import shutil
import subprocess


def clone_repo() -> None:
    if not path.exists(languagetool_path):
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
        subprocess.run(["git", "checkout", languagetool_commit], cwd=languagetool_path)


def copy_folder(language: Tuple[str, str]) -> None:
    code = language[0]
    name = language[1]
    name_ = re.sub(r"\W", "", name)
    languages_folder = path.join(
        languagetool_path, "languagetool-language-modules", prefix + code
    )
    if path.exists(languages_folder):
        print(
            "Language folder for {} already exists. Not creating Java files.".format(
                prefix + code
            )
        )
    else:
        print("Creating Java files for {}.".format(prefix + code))

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
    if path.exists(languagetool_build_path):
        print("Build target already exists. Not rebuilding.")
    else:
        print("Build target does not yet exist. Building with Docker ...")
        subprocess.run(
            "docker run --rm --name my-maven-project -v {}:/usr/src/mymaven -v {}/.m2:/root/.m2 -w /usr/src/mymaven maven:3.8-openjdk-8 ./build.sh languagetool-standalone package -DskipTests".format(
                path.abspath(languagetool_path), Path.home()
            ).split(
                " "
            ),
            cwd=languagetool_path,
        )
        # docker run -it --rm --name my-maven-project -v (pwd):/usr/src/mymaven -v $HOME/.m2:/root/.m2 -w /usr/src/mymaven maven:3.8-openjdk-8 ./build.sh languagetool-standalone package -DskipTests


def start_languagetool():
    subprocess.run(
        ["java", "-jar", "languagetool.jar"],
        cwd=languagetool_build_path,
    )


if __name__ == "__main__":
    clone_repo()
    for language in gender_languages:
        copy_folder(language)
    register(gender_languages)
    build_with_docker()
    copy_grammar_files()
