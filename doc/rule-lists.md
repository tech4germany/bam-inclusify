# Working with the rule lists

INCLUSIFY provides suggestions for word replacements. These suggestions are based on large lists of rules. Most of these rules have been created in semi-automatic ways and by reusing existing lists (see TODO). When using INCLUSIFY, users will probably occasionally make requests to the admins to remove, add, and change rules. This is possible by editing the rule file.

The rules are stored in `inclusify_server/data/suggestions_editable.csv`. Unfortunately, the CSV file cannot be opened or imported correctly into Microsoft Excel, and it also exports into a not-so-clean format, so we advise to edit the file in a simple text editor or a CSV editor.

## Schema

Each line consists of four values, the schema is:

```
replaced phrase,alternative phrase,category number,source
```

For example:

```
Putzfrau,Putzkraft,0,bam
```

The source field can be any string denoting the source of the entry. It will not be used by the and can also be left empty, but don't forget the comma:

```
Putzfrau,Putzkraft,0,
```

When there is a comma within any field, double quotes should be used:

```
Putzfrau,"Person, die putzt",0,bam
```

When there are multiple replacements for one word, each should be given in a separate line:

```
Putzfrau,Putzkraft,0,bam
Putzfrau,"Person, die putzt",0,bam
```

Besides nouns, rules can also involve adjectives:

```
kundenfreundlich,nutzungsfreundlich,0,geschicktgendern
```

In the future, verbs should be accepted as well.

The rules can also include complex phrases. The system will automatically figure out which words should be adjusted in case (nominative, ...) and number (singular / plural). An example for a complex phrase:

```
landwirtschaftliche Erzeuger,Produzierende von landwirtschaftlichen Produkten,0,geschicktgendern
```

Most rules, however, are just about simple noun-to-noun replacements.

### Category number

The category number should be `0`, `1`, or `2`. We also give some examples of rules, and what suggestions they will cause on a given text:

- 0: The replacement is the same word as the replaced word, but with female gender. Will be used to compute gendered words according to the user's preferences. Case (nominative, ...) and number (singular / plural) will be automatically adjusted to the replaced word.
  - `Beamter,Beamtin,0,bam`
    - gender style \_: "der Beamte" > "der_die Beamt_in"
    - gender style \*: "die Beamten" > "die Beamt\*innen"
  - `Manager,Managerin,0,bam`
    - gender style double: "den Managern" > "den Managerinnen und Manager"
    - gender style \*: "dem Manager" > "dem\*der Manager\*in"
    - gender style neutral: "dem Manager" > \[no suggestion, due to gender style + category 0\]
- 1: The replacement is an alternative word with neutral gender. Case (nominative, ...) and number (singular / plural) will be automatically adjusted to the replaced word.
  - `Beamter,verbeamtete Person,1,bam`
    - "des Beamten" > "der verbeamteten Person"
    - "die Beamten" > "die Verbeamteten"
  - `Manager,Management,1,bam`
    - "den Managern" > "den Managements"
    - "dem Manager" > "dem Management"
- 2: The replacement is an alternative word with neutral gender which is only applicable when the replaced word is in **plural**. This is useful when the replacement does not have a singular (such as "Leute", "folks"), or when the replacement is a singular word that possibly describes multiple people (such as "Management"). Case (nominative, ...) will be automatically adjusted to the replaced word, but the **number** (singular / plural) will **not** be adjusted.
  - `Beamter,Beamtenschaft,2,bam`
    - "des Beamten" > "der verbeamteten Person"
    - "die Beamten" > "die Verbeamteten"
  - `Manager,Management,2,bam`
    - "den Managern" > "dem Management"
    - "dem Manager" > \[no suggestion, due to singular + category 2\]

## Processing

The rule lists will autimatically be processed, so the rules can be used faster when the app is running. The processing happens in the `inclusify_server/prepare_list.py` module, and new/changed/deleted rules are automatically processed when the server (re)starts. The results are stored in `inclusify_server/data/suggestions_processed.csv`. That file should not be edited manually.
