<h1><img alt="INCLUSIFY logo" height="40" src="./react-ui/src/common/icons/inclusify-logo.svg"><img alt="Tech4Germany logo" height="45" src="./doc/images/tech4germany-logo.png" align="right"></h1>

[ [Live Demo](https://inclusify.tech.4germany.org/) 🚀 | [Project Info](https://tech.4germany.org/project/diversitatssensible-sprache-inclusify-bam/) 💁 | [Tech4Germany Fellowship](https://tech.4germany.org/) 🤓 ]

<a href="./doc/images/screenshot-inclusify-welcome-page.png"><img alt="INCLUSIFY start screen" height="200" src="./doc/images/screenshot-inclusify-welcome-page.png"></a>
<a href="./doc/images/screenshot-inclusify-with-results.png"><img alt="INCLUSIFY with results" height="200" src="./doc/images/screenshot-inclusify-with-results.png"></a>

🇬🇧 This is the source code repository of the _INCLUSIFY_ project of the Tech4Germany Fellowship 2021.
You can use this code under the terms of the provided license.

🇩🇪 Die ist das Source-Code Repository des Projekts _INCLUSIFY_ des Tech4Germany Fellowships 2021.
Sie können den Code unter den Bedingungen der angegeben Lizenz nutzen.

TODO: About this app and about the T4G project, link to project page

## Using the INCLUSIFY Docker image

Make sure to have [Docker](https://www.docker.com/) installed.

Use the following command to download the INCLUSIFY Docker image and start a new container. Note that the image is quite large and may take some time to download.

```sh
docker run --rm -p 80:80 -ti --pull always ghcr.io/tech4germany/inclusify-app:latest
```

Once you see a message like _"Done loading morphological dictionary."_, you can open http://localhost in your web browser and use the INCLUSIFY web-app from there! 🥳

_Note: This Docker image hosts the app without HTTPS. This is fine for local testing, but isn't appropriate for any kind of deployment where other people use the app. For actual production deployments, consider putting an HTTPS reverse proxy in front of the INCLUSIFY container._

## Technical Documentation

See [doc/index.md](./doc/index.md).
