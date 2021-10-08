from gender_config import gender_languages, prefix
from helpers import open_, update_with_backup
from os import path
from paths import *


def copy_grammar_files() -> None:
    for code, _, _ in gender_languages:
        print("Copying grammar to {}.".format(prefix + code))
        grammar_path = path.join("org", "languagetool", "rules", prefix + code)
        rulefile = "grammar_{}.xml".format(code)
        xml = open_(path.join("grammars", rulefile)).read()
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


if __name__ == "__main__":
    copy_grammar_files()