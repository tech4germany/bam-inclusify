#!/usr/bin/python
# -*- coding: utf-8 -*-
from os import path

def copy_files():
  languagetool_path = path.join("..", "languagetool", "LanguageTool-5.4") # adjust this to the folder of the LanguageTool release
  grammar_path = path.join(languagetool_path, "org", "languagetool", "rules", "de") # path of the German grammar files within the LanguageTool release

  xml = open(path.join("wordlists", "grammar_custom.xml")).read()
  custom_filename = "grammar_custom.xml"
  open(path.join("wordlists", custom_filename), "w").write(xml)
  open(path.join(grammar_path, custom_filename), "w").write(xml)

  # Use backup file if available (see comments below)
  if path.isfile(path.join(grammar_path, "grammar.xml.old")):
    old_xml = open(path.join(grammar_path, "grammar.xml.old")).read()
  else:
    old_xml = open(path.join(grammar_path, "grammar.xml")).read()
    # Save backup of the old grammar file.
    open(path.join(grammar_path, "grammar.xml.old"), "w").write(old_xml)

  new_xml = old_xml.replace(
        "<!DOCTYPE rules [", 
        '<!DOCTYPE rules [ \n\t<!ENTITY UserRules SYSTEM "file:///{}">'.format(path.abspath(path.join(grammar_path, custom_filename)))
    ).replace(
        "</rules>", 
        '<category id="DIVERSITY_SENSITIVE_LANGUAGE" name="Erweiterung für diversitätssensible Sprache">\n&UserRules;\n</category>\n</rules>'
    )

  # Replace with file where the new rules have been added.
  open(path.join(grammar_path, "grammar.xml"), "w").write(new_xml)

copy_files()