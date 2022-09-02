FROM alpine

COPY ./tools/entrypoint.sh /entrypoint.sh

RUN apk update && apk add nodejs npm postgresql-client && mkdir -p /var/www/html && chmod +x /entrypoint.sh

WORKDIR /var/www/html

ENTRYPOINT [ "sh" ]
CMD ["/entrypoint.sh"]