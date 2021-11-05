# Data sets

We have explored multiple data sets. The links go to Jupyter Notebooks describing what we did.

- [x] [**geschicktgendern.**](../data/geschicktgendern/main.ipynb) Provides a list with ~3500 gender neutral alternatives, which is regularly updated. We have processed and manually adjusted these data, and it is our main source.

- [x] [**Deutsches Referenzkorpus (DeReKo).**](../data/dereko/main.ipynb) We have extracted words with gender symbols, so that we can suggest to use a gender symbol, when one of these words occurs without a gender symbol. We have filtered the list manually, leaving us with ~3800 suggestions.

- [ ] [**Vienna catalog.**](../data/vienna_catalog/main.ipynb) Provides ~2300 gendered suggestions (double notation and inner I) from a government context. We have processed these data a bit but have not found the time to normalize them.

- [ ] [**OpenThesaurus.**](../data/openthesaurus/main.ipynb) We have extracted ~3500 male words relating to persons. We have retrieved synonyms for them from OpenThesaurus, but these were of low quality, so we do not use them.

- [ ] Custom rules.

  - [ ] We have created an [XML file for LanguageTool](../data/disability_rules.xml) (which we have used at first as a backend) with ~20 rules on disability, some of them very elaborate and with messages. These still need to be appropriately transfered to our new Python backend.

  - [ ] We have created [a CSV file](../data/illness_rules.csv) in our own format with ~20 rules on illness. They are relatively easy to integrate into the Python backend, but we have not done so yet.

- [ ] [**Wiktionary**](https://de.wiktionary.org/wiki/Wiktionary:Download) (external link) provides links between many words for male and female persons. This is a potential high-quality source still to be leveraged.

- [ ] [**retext-equality**](https://github.com/retextjs/retext-equality) (external link) provides suggestions for sensitive language in English in all dimensions of diversity, along with explanations. Since many scientists and also civil servants at BAM write in English, language detection could be integrated, and for English, retext-equality could be used. There are not as many issues in English as there are in German (especially with respect to gender), so retext-equality can be considered a "complete" solution for English.

- [ ] [**C4-german**](https://german-nlp-group.github.io/projects/gc4-corpus.html) (external link) is another very large corpus for German focusing more on recent data. It could be mined in a similar fashion as we have done with DeReKo.

The unified data from geschicktgendern and DeReKo can be found in [`data/unified.csv`](../data/unified.csv). A version of this is in [`inclusify_server/data/suggestions_editable.csv`](../inclusify_server/data/suggestions_editable.csv), and is intended to be edited by BAM during the course of the further testing phase. The format of these rule files is explained [here](./rule-lists.md).

## Running the Jupyter Notebooks

From the [`data`](../data) folder of this repository:

1. Create an empty virtual environment in the `.venv` directory:

   ```
   python3.9 -m venv .venv
   ```

2. Open the environment in your command line instance:

   ```
   source .venv/bin/activate
   ```

   (Perhaps you need to use a shell-specific script like `source .venv/bin/activate.fish`.)

3. Install tools to make installing libraries more efficient:

   ```
   pip install -U pip wheel setuptools
   ```

4. Install the project dependencies at the correct versions into the virtual environment:

   ```
   pip install -r requirements.txt
   ```

5. Finished! Now you can run `jupyter notebook` to start the web server and use the notebooks in the subfolders of the [`data`](../data) folder. When you come back after closing your command line window, you will need to repeat step 2 to load the virtual environment again.
