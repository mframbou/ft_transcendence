FROM alpine

COPY ./tools/entrypoint.sh /entrypoint.sh

RUN apk update && apk add nodejs npm && mkdir -p /var/www/html && chmod +x /entrypoint.sh

WORKDIR /var/www/html

ENTRYPOINT [ "sh" ]
CMD ["/entrypoint.sh"]