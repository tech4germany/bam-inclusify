from helpers import open_, update_with_backup
from os import path
from paths import *


def copy_grammar_files() -> None:
    print("Copying grammar.")
    xml = open_(rulefile).read()
    open_(path.join(languagetool_path, grammar_path, rulefile), "w").write(
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
        path.join(languagetool_path, grammar_path, "grammar.xml"),
    )

def copy_pos_tags():
    print("Copying file with additional POS tags ...")
    added_tags = open_(path.join("retext-equality", "added.txt")).read()
    def update_pos_file(old):
        return old + added_tags

    update_with_backup(update_pos_file, path.join(languagetool_path, "org", "languagetool", "resource", "de", "added.txt"))



if __name__ == "__main__":
    copy_grammar_files()
    copy_pos_tags()
