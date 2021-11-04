# INCLUSIFY App - Python Backend Documentation

The backend is written in Python 3.9 and uses the [Flask](https://flask.palletsprojects.com/en/2.0.x/) framework. It serves both the static frontend pages, and an API for retrieving diversity suggestions for a given text. For development, the server can be started as a simple Python module. For production, it is recommended to use a proper server; we will use [gunicorn](https://gunicorn.org/) as a server.

## Installing and starting the server

The following steps are automated in the Docker image, see [here](./development-environment.md).

1. It is recommended to use a virtual environment for installing the dependencies. Create and activate a new virtual environment:

   - Either with Python 3.9:

     ```
     python3.9 -m venv .venv && source .venv
     ```

   - Or with Anaconda/Miniconda:

     Make sure Conda is installed and initialized with `conda init bash` (or the name of your shell). Then:

     ```
     conda create --name inclusify --channel conda-forge python=3.9 pip && conda activate inclusify
     ```

2. Inside the environment, use pip for installing the dependencies:

   ```
   pip install -r inclusify_server/requirements.in
   ```

   (This is also for Anaconda/Miniconda environments, because not all of our dependencies are published in Anaconda channels.)

3. Still inside the environment, start the server.

   - For development, run the Python module:

     ```
     python -m inclusify_server.app
     ```

   - For pruduction, with gunicorn:

     ```
     gunicorn inclusify_server.app:app --bind localhost:8081 --timeout 90
     ```

     Any desired port can be specified here instead of `8081`. For Python frameworks, there is the compatibility standard _WSGI_ for communication between web frameworks and servers. Flask is WSGI-compatible, so you can use any WSGI-compatible server to serve it.

## API

- `/` (GET) serves the static website.
- `/taskpane.html` serves the static website for the Word add-in.
- `/v2/check` (POST)
  The body (!) must contain an x-www-form-urlencoded (!) key-value-pair (!), where the key is `text` and the value an arbitrary, potentially very long string of the text that should be checked.

  Example of the body: `text=Die%20Pr%C3%A4sidenten%20sind%20Langweiler.`

  The response is a JSON object, where under the key `matches` there is a list of matches. Each match is about one phrase that should be replaced, and it contains information about the phrase and the replacement suggestions. The JSON always has the same structure and no surprises, thus we give an example:

  ```json
  {
    "matches": [
      {
        "context": { "length": 11, "offset": 0, "text": "Pr\u00e4sidenten" },
        "length": 11,
        "message": "...",
        "offset": 4,
        "replacements": [
          { "value": "Pr\u00e4sident*innen" },
          { "value": "Pr\u00e4sidentinnen und Pr\u00e4sidenten" },
          { "value": "Staatsoberhaupt" },
          { "value": "Vorsitz" },
          { "value": "Vorsitzende" }
        ],
        "rule": {
          "category": {
            "id": "GENERISCHES_MASKULINUM",
            "name": "Generisches Maskulinum"
          }
        },
        "shortMessage": "..."
      },
      {
        "context": { "length": 10, "offset": 0, "text": "Langweiler" },
        "length": 10,
        "message": "...",
        "offset": 21,
        "replacements": [
          { "value": "Langweiler*innen" },
          { "value": "Langweilerinnen und Langweiler" }
        ],
        "rule": {
          "category": {
            "id": "GENERISCHES_MASKULINUM",
            "name": "Generisches Maskulinum"
          }
        },
        "shortMessage": "..."
      }
    ]
  }
  ```

  (`.length` and `.context.length`, and `.offset` and `.context.offset` are respectively identical. The distinct keys exist for compatibility reasons with the LanguageTool API, see below. The list of replacements may be empty.)

  As seen in the bove example JSON snippet, the `replacements` list contains a mix of different gender styles: There are neutral words, words with gender star, and words in double notation with "und" or "oder". We filter these values in the frontend in [`react-ui/src/common/language-tool-api/user-settings-language-mapping.ts`](../react-ui/src/common/language-tool-api/user-settings-language-mapping.ts), and we replace the gender star with other symbols as specified by the user preferences. This is of course not ideal - what if there is a phrase with "und" that is not gender double notation? So, the API should be changed here in the future.

### Compatibility with LanguageTool

We have previously used [LanguageTool](https://github.com/languagetool-org/languagetool), a powerful open source grammar checker, for our backend. Our frontend is compatible with the [LanguageTool API](https://languagetoolplus.com/http-api/#/default) and could be used to display suggestions from LanguageTool. The server API therefore mimicks the LanguageTool API, but only to the very small extent which our frontend actually uses. In the future, the API could be extended to fully cover the LanguageTool API, and then the various [LanguageTool frontends](https://dev.languagetool.org/software-that-supports-languagetool-as-a-plug-in-or-add-on) could be used with INCLUSIFY.

This could be especially interesting for 2 scenarios:

- Integration of INCLUSIFY into LibreOffice. There is an open source LanguageTool add-in for LibreOffice. This could be forked, and controls for gender style etc could be added. For LibreOffice, a much better UI integration is possible than it is possible for Microsoft Word. Especially with the long-term plan of the government to use CollaboraOffice, essentially a web version of LibreOffice, as part of the [Phoenix suite](https://www.phoenix-werkstatt.de/), this scenario could become very relevant. We have not checked whether LibreOffice extensions also work with CollaboraOffice.

- Integration of INCLUSIFY into web browsers. It is a lot of effort to build a browser extension (although [FairLanguage](https://github.com/fairlanguage) have attempted this). The LanguageTool browser extensions can be configured to work with a custom server in the settings of the extensions. This is probably too much to expect from users, but these settings can be configured via the Windows registry or a configuration file on MacOS, and these can be managed centrally (via Group Policy settings on Windows) within an organization (more specific documentation is available from [LanguageTool](support@languagetoolplus.com)). However, the LanguageTool browser extensions are not open source, and it is not possible to integrate own settings into them. We tried to circumvene this restriction by implementing the various gender styles as different languages in the LanguageTool API, but the in the browser extensions the list of languages is fixed rather than loaded from the list of languages from the API (see [this issue](https://forum.languagetool.org/t/firefox-add-on-new-language/6105)), and this is not expected to be changed soon.

In our project, we have decided to focus on the Word add-in and the website, both of which we have built from scratch, and compatibility with LanguageTool has become an afterthought. For future integrations, it may be useful to restore this compatibility by completely mimicking the LanguageTool API.

If compatiblity with LanguageTool is _not_ desired, it would be good to simplify the API. The frontend uses automatically generated types for the whole LanguageTool API (`react-ui/src/common/language-tool-api`), and these could then be replaced by much simpler types.

### Internal working of the backend

TODO

For information about the rule lists and how to edit them, see [here](./rule-lists.md).
