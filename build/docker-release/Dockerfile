#####
# Builder layer for React Frontend
#####

FROM node:14-bullseye AS builder

ARG REACT_APP_SHOW_IMPRESSUM_AND_DATENSCHUTZ

RUN apt-get update && \
  apt-get install -y zip

RUN adduser --quiet --disabled-password --shell /bin/bash --home /home/inclusify --gecos "" inclusify
USER inclusify

WORKDIR /home/inclusify/inclusify-build

ENV PATH="${PATH}:/home/inclusify/.yarn/bin"
RUN yarn global add devcmd-cli

ADD --chown=inclusify:inclusify ./dev_cmds/ dev_cmds/
RUN cd dev_cmds && yarn install

ADD --chown=inclusify:inclusify ./react-ui/ react-ui/
RUN cd react-ui && yarn install

ADD --chown=inclusify:inclusify . .
RUN devcmd setup
RUN devcmd prepare-server


#####
# Release layer for final image
#####

FROM python:3.9-bullseye

RUN apt-get update && \
  apt-get install -y gunicorn && \
  rm -rf /var/lib/apt/lists/*

RUN adduser --quiet --disabled-password --shell /bin/bash --home /home/inclusify --gecos "" inclusify
USER inclusify
WORKDIR /home/inclusify/inclusify-build

COPY --from=builder --chown=inclusify:inclusify /home/inclusify/inclusify-build/inclusify_server ./inclusify_server
RUN pip install --no-warn-script-location --disable-pip-version-check -r inclusify_server/requirements.in
RUN python3 -m inclusify_server.download_language_models

ENV INCLUSIFY_BIND_HOST=0.0.0.0
ENV INCLUSIFY_BIND_PORT=80
ENV INCLUSIFY_STARTUP_TIMEOUT_SEC=900

EXPOSE ${BIND_PORT}

CMD gunicorn inclusify_server.app:app \
  --bind ${INCLUSIFY_BIND_HOST}:${INCLUSIFY_BIND_PORT} \
  --timeout ${INCLUSIFY_STARTUP_TIMEOUT_SEC}

ARG BUILD_DATE
ARG VCS_REVISION

# OCI Labels as per https://github.com/opencontainers/image-spec/blob/main/annotations.md
LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.title="inclusify-app"
LABEL org.opencontainers.image.description="INCLUSIFY - Deine Assistentin für diversitätssensible Sprache"
LABEL org.opencontainers.image.url="https://github.com/tech4germany/bam-openminded"
LABEL org.opencontainers.image.source="https://github.com/tech4germany/bam-openminded"
LABEL org.opencontainers.image.revision=$VCS_REVISION
