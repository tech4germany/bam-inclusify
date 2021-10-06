FROM openjdk:8-jre-slim-bullseye

RUN apt update && \
  apt install -y nginx supervisor

ENV INCLUSIFY_USER_NAME=inclusify \
  INCLUSIFY_USER_UID=10001 \
  INCLUSIFY_API_DIR=/srv/inclusify/api \
  INCLUSIFY_API_PORT=8081 \
  INCLUSIFY_FRONTEND_DIR=/srv/inclusify/frontend

COPY build/docker-release/languagetool.supervisord.conf /etc/supervisor/conf.d/
COPY build/docker-release/nginx.supervisord.conf /etc/supervisor/conf.d/

COPY build/docker-release/inclusify-app.nginx.conf /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/inclusify-app.nginx.conf /etc/nginx/sites-enabled/inclusify-app.nginx.conf

COPY languagetool/LanguageTool-5.4/ ${INCLUSIFY_API_DIR}/
COPY react-ui/build/  ${INCLUSIFY_FRONTEND_DIR}/

RUN adduser -u ${INCLUSIFY_USER_UID} -h ${INCLUSIFY_API_DIR} -s /sbin/nologin ${INCLUSIFY_USER_NAME}

EXPOSE $INCLUSIFY_API_PORT
EXPOSE 80

CMD supervisord -n -c /etc/supervisor/supervisord.conf
