# OpenMinDEd App

## Parts of this repository

What is where:

* `data/` - word lists, text corpora, and other input data, as well as pre-processing scripts to turn this data into usable inputs for the LanguageTool backend
* `languagetool/` - the LanguageTool backend (API server) and related things, e.g. the WAR-file wrapper for Tomcat deployment
* `react-ui/` - the graphical end-user app (frontend) for use as a standalone webpage in a browser and in Word/Outlook add-ins

## Setting up certificates for development

* Go to `react-ui/node_modules/office-addin-dev-certs/cli.js` and change the end of lines format to `LF` to avoid a bug.
* Use `yarn office-addin-dev-certs install` to obtain certificates.
* Create a file `react-ui/.env.local` with contents:

```
DEVSERVER_HTTPS_KEY=$HOME/.office-addin-dev-certs/localhost.key
DEVSERVER_HTTPS_CERT=$HOME/.office-addin-dev-certs/localhost.crt
DEVSERVER_HTTPS_CA=$HOME/.office-addin-dev-certs/ca.crt
```

## Starting the app

* `cd dev_cmds && yarn install`
* `cd react-ui && yarn install`
* Start the API part: `cd dev_cmds && yarn devcmd start-api`
* Start the UI part: `cd dev_cmds && yarn devcmd start-ui`
