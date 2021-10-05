FROM openjdk:8-jre-slim-buster

ENV INCLUSIFY_USER_NAME=inclusify \
  INCLUSIFY_USER_UID=10001 \
  INCLUSIFY_API_DIR=srv/inclusify/api \
  INCLUSIFY_API_PORT=8081

COPY languagetool/LanguageTool-5.4/ ${INCLUSIFY_API_DIR}/

RUN adduser -u ${INCLUSIFY_USER_UID} -h ${INCLUSIFY_API_DIR} -s /sbin/nologin ${INCLUSIFY_USER_NAME}

WORKDIR $INCLUSIFY_API_DIR

USER ${INCLUSIFY_USER_UID}
EXPOSE $INCLUSIFY_API_PORT

CMD "java" \
  "-cp" "languagetool-server.jar" \
  "org.languagetool.server.HTTPServer" \
  "--port" $INCLUSIFY_API_PORT \
  "--allow-origin" "*" \
  "--public"
