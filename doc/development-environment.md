# Development Environment

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

We automated many common build and development tasks, mostly using [DevCmd](https://github.com/XITASO/devcmd). These scripts are located in the `dev_cmds` directory in the repo root.

We recommend installing and using DevCmd's global launcher tool (see above).

If you can't or don't want to use this global launcher, you can replace any command that looks like `devcmd <SCRIPTNAME>` equivalently with `cd dev_cmds && yarn devcmd <SCRIPTNAME>`.

## Parts of this repository

What is where (relative to the repo root):

- `data/` - word lists, text corpora, and other input data, as well as pre-processing scripts to turn this data into usable inputs for the NLP backend
- `dev_cmds/` - build scripts and development task automation using [DevCmd](https://github.com/XITASO/devcmd)
- `doc/` - this documentation
- `inclusify_server/` - the Python backend that analyzes users' inputs and provides improvement suggestions using NLP methods
- `react-ui/` - the graphical end-user app (frontend) for use as a standalone webpage in a browser and in Word/Outlook add-ins

## Starting the app for development

- Start the API part: `devcmd start-api`
- Start the UI part: `devcmd start-ui`

## Building for production / deployment

- `devcmd build-docker-image`: Creates a Docker image that contains the API backend and the static assets for the frontend, served on port 80 (i.e. non-HTTPS) inside the container. The script prints the name of the created image when it's done, so you can push or export the image easily.
  - `devcmd start-docker`: If you've previously built the Docker image with the command above, you this command starts a new Docker container from this image locally.
- `devcmd build-zip-file`: Creates a ZIP file in the repository root containing the API backend and the static assets for the frontend. This is intended for directly running the Python backend instead of deploying a Docker container.
- `devcmd create-addin-manifest`: Installing the Word add-in requires a `manifest.xml` that points to the correct host where the INCLUSIFY app is deployed. This command creates a suitable manifest file for the host URL you provide as an argument.
