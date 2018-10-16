FROM quay.io/dexidp/dex:v2.12.0

RUN apk update && apk add bash

COPY wait-for-it.sh wait-for-it.sh
COPY config.yaml config.yaml

WORKDIR /

ENTRYPOINT [""]

CMD ["version"]