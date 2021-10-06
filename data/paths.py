from os import path

languagetool_path = path.join("..", "languagetool", "languagetool")

languagetool_version = "5.6-SNAPSHOT"

languagetool_commit = "b7bbf58c2525165a35ed84312a433751c8f182f2"

languagetool_build_path = path.join(
    languagetool_path,
    "languagetool-standalone",
    "target",
    "LanguageTool-" + languagetool_version,
    "LanguageTool-" + languagetool_version,
)

grammar_path = path.join("org", "languagetool", "rules", "de")
