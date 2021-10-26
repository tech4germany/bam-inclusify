# INCLUSIFY App Technical Documentation

_Note: We have only used macOS and Linux for development, so these instructions might be incomplete for a Windows environment._

## Prerequisites for development

- [Node.js](https://nodejs.org/en/) v14 or newer
- [(Classic) Yarn](https://classic.yarnpkg.com/lang/en/) v1.22 or newer (though not Yarn 2)
- [Python 3](https://www.python.org/) v3.9 or newer
- (optional) if you want to build the Docker image or run the app in a Docker container: [Docker](https://www.docker.com/)

## First-time setup

After cloning this repo, do the following steps to get prepare your development environment:

- Install the dependencies for the dev scrips:  
  `cd dev_cmds && yarn install && yarn devcmd setup`
- If you want to use the [DevCmd](https://github.com/XITASO/devcmd) global launcher, also run:  
  `yarn global add devcmd-cli`

## DevCmd for dev scripts

We automated many common build and development tasks, mostly using [DevCmd](https://github.com/XITASO/devcmd). These scripts are located in the `dev_cmd` directory in the repo root.

We recommend installing and using DevCmd's global launcher tool (see above).

If you can't or don't want to use this global launcher, you can replace any command that looks like `devcmd <SCRIPTNAME>` equivalently with `cd dev_cmds && yarn devcmd <SCRIPTNAME>`.

## Parts of this repository

What is where (relative to the repo root):

- `data/` - word lists, text corpora, and other input data, as well as pre-processing scripts to turn this data into usable inputs for the NLP backend
- `dev_cmds/` - build scripts and development task automation using [DevCmd](https://github.com/XITASO/devcmd)
- `doc/` - this documentation
- `inclusify_server/` - the Python backend that analyzes users' inputs and provides improvement suggestions using NLP methods
- `react-ui/` - the graphical end-user app (frontend) for use as a standalone webpage in a browser and in Word/Outlook add-ins

## Setting up certificates for local Office Add-in development

_See also [`office-addin-dev-certs`](https://www.npmjs.com/package/office-addin-dev-certs) and the [Word add-in development docs](https://docs.microsoft.com/en-us/office/dev/add-ins/word/) for more info._

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
        "title": "Contribute",
        "subtitle": "auf GitHub",
        "url": "https://github.com/tech4germany/bam-inclusify"
      },
      {
        "title": "Projektseite",
        "url": "https://github.com/tech4germany/bam-inclusify"
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
    "addinLogoLinkUrl": "https://github.com/tech4germany/bam-inclusify"
    // . . .
  }
  ```
