#!/usr/bin/python
# -*- coding: utf-8 -*-
from os import path

# adjust this to the folder of the LanguageTool release
languagetool_path = path.join("..", "languagetool", "LanguageTool-5.4")
# path of the German grammar files within the LanguageTool release
grammar_path = path.join(languagetool_path, "org", "languagetool", "rules", "de")
# file name of the additional grammar rules
rulefile = "grammar_openminded.xml"

def copy_files():
    xml = open(rulefile, encoding="utf-8").read()
    open(path.join(grammar_path, rulefile), "w", encoding="utf-8").write(xml)

    # Use backup file if available (see comments below)
    if path.isfile(path.join(grammar_path, "grammar.xml.old")):
        old_xml = open(path.join(grammar_path, "grammar.xml.old"), encoding="utf-8").read()
    else:
        old_xml = open(path.join(grammar_path, "grammar.xml"), encoding="utf-8").read()
        # Save backup of the old grammar file.
        open(path.join(grammar_path, "grammar.xml.old"), "w", encoding="utf-8").write(old_xml)

    new_xml = old_xml.replace(
        "<!DOCTYPE rules [",
        '<!DOCTYPE rules [ \n\t<!ENTITY UserRules SYSTEM "file:///{}">'.format(
            path.abspath(path.join(grammar_path, rulefile))
        ),
    ).replace(
        "</rules>",
        '<category id="DIVERSITY_SENSITIVE_LANGUAGE" name="Erweiterung für diversitätssensible Sprache">\n&UserRules;\n</category>\n</rules>',
    )

    # Replace with file where the new rules have been added.
    open(path.join(grammar_path, "grammar.xml"), "w", encoding="utf-8").write(new_xml)


if __name__ == "__main__":
    copy_files()
