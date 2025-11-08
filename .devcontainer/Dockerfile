FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    cmake ninja-build clang curl jq git && \
    rm -rf /var/lib/apt/lists/*

# Syft & Cosign utilitários
RUN curl -sSL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin \
 && curl -sSL https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64 -o /usr/local/bin/cosign \
 && chmod +x /usr/local/bin/cosign

# Diretório de trabalho padrão
WORKDIR /workspaces/shancrys
