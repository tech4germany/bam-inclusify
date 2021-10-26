# INCLUSIFY App

TODO: Logo

TODO: Live Demo

TODO: About this app and about the T4G project, link to project page

TODO: Screenshots

## Using the INCLUSIFY Docker image

Make sure to have [Docker](https://www.docker.com/) installed.

Use the following command to download the INCLUSIFY Docker image and start a new container. Note that the image is quite large and may take some time to download.

```sh
docker run --rm -p 80:80 -ti --pull always ghcr.io/tech4germany/inclusify-app:latest
```

Once you see a message like _"Done loading morphological dictionary."_, you can open http://localhost in your web browser and use the INCLUSIFY web-app from there! 🥳

## Technical Documentation

See [doc/index.md](./doc/index.md).
