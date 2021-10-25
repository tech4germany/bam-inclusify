# INCLUSIFY App Technical Documentation

## Parts of this repository

What is where:

- `data/` - word lists, text corpora, and other input data, as well as pre-processing scripts to turn this data into usable inputs for the LanguageTool backend
- `dev_cmds/` - build scripts and development task automation using [DevCmd](https://github.com/XITASO/devcmd)
- `react-ui/` - the graphical end-user app (frontend) for use as a standalone webpage in a browser and in Word/Outlook add-ins

## Prerequisites for development

- [Node.js](https://nodejs.org/en/) v14 or newer
- [(Classic) Yarn](https://classic.yarnpkg.com/lang/en/) v1.22 or newer (though not Yarn 2)
- [Python 3](https://www.python.org/) v3.9 or newer
- (optional) if you want to build the Docker image or run the app in a Docker container: [Docker](https://www.docker.com/)

## Setting up certificates for development

- (On macOS & Linux:) Go to `react-ui/node_modules/office-addin-dev-certs/cli.js` and change the end of lines format to `LF` to avoid a bug.
- Use `yarn office-addin-dev-certs install` to obtain certificates.
- Create a file `react-ui/.env.local` with contents:

```
DEVSERVER_HTTPS_KEY=$HOME/.office-addin-dev-certs/localhost.key
DEVSERVER_HTTPS_CERT=$HOME/.office-addin-dev-certs/localhost.crt
DEVSERVER_HTTPS_CA=$HOME/.office-addin-dev-certs/ca.crt
```

## Starting the app

- First-time setup: `cd dev_cmds && yarn install && yarn devcmd setup`
- If you want to use the [DevCmd](https://github.com/XITASO/devcmd) global launcher (e.g. `yarn global add devcmd-cli`):
  - Start the API part: `devcmd start-api`
  - Start the UI part: `devcmd start-ui`
- Otherwise, you can use the scripts like this:
  - Start the API part: `cd dev_cmds && yarn devcmd start-api`
  - Start the UI part: `cd dev_cmds && yarn devcmd start-ui`

## Adjusting the links in the navigation bar (Standalone) and for the INCLUSIFY logo (Addin)

- You can adjust the external links shown in the INCLUSIFY app in the `navigation-links.json` file (i.e. the links shown in the navigation bar at the top of the Standalone page, and the link used for the INCLUSIFY logo element in the Addin)
  - Note: in both cases, URLs are only accepted when they start with "http://" or "https://"
- For the links shown in the navigation bar at the top of the Standalone page:
  - In `react-ui/src/navigation-links.json`, edit the list in the key `"standaloneNavigationLinks"`
  - Each item in this list must have at least the two entries `"title"` and `"url"` (both must be strings), and can optionally have an entry `"subtitle"` (also a string), which is shown under the "title" in smaller font
  - Example:
  ```json
  {
    // . . .
    "standaloneNavigationLinks": [
      {
        "title": "BAM Leitfaden",
        "subtitle": "für geschlechtergerechte Sprache",
        "url": "https://www.bam.de/path/to/page"
      },
      {
        "title": "BAM Webseite",
        "url": "https://www.bam.de/en"
      }
    ]
    // . . .
  }
  ```
- For the link used for the INCLUSIFY logo element in the Addin:
  - In `react-ui/src/navigation-links.json`, edit the value of the key `"addinLogoLinkUrl"`
  - Example:
  ```json
  {
    // . . .
    "addinLogoLinkUrl": "https://www.bam.de/"
    // . . .
  }
  ```
