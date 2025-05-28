FROM vault:1.13.3

USER root

RUN apk add --no-cache curl jq

COPY vault-init.sh /vault/vault-init.sh
RUN chmod +x /vault/vault-init.sh

ENTRYPOINT ["/vault/vault-init.sh"]
