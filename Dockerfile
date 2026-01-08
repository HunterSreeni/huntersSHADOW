# Use Ubuntu as the base image
FROM ubuntu:22.04

# Avoid interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Update and install basic dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    vim \
    unzip \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    dnsutils \
    iputils-ping \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (Latest LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install Golang (Required for Nuclei, Subfinder, Ffuf)
RUN curl -OL https://go.dev/dl/go1.22.0.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz \
    && rm go1.22.0.linux-amd64.tar.gz

ENV PATH=$PATH:/usr/local/go/bin:/root/go/bin

# Install Bug Bounty Tools (Go-based)
# Nuclei: Template based vulnerability scanner
# Subfinder: Subdomain discovery tool
# Ffuf: Fast web fuzzer
RUN go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest \
    && go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest \
    && go install -v github.com/ffuf/ffuf/v2@latest \
    && nuclei -update-templates

# Install Security/Recon Tools
# nmap: Network Scanner
# gobuster: Directory/File, DNS and VHost busting tool written in Go
RUN apt-get update && apt-get install -y \
    nmap \
    gobuster \
    && rm -rf /var/lib/apt/lists/*

# Download Rockyou Wordlist
RUN mkdir -p /usr/share/wordlists \
    && curl -L -o /usr/share/wordlists/rockyou.txt https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Link the CLI globally
RUN npm link

# Ensure the entrypoint is executable
RUN chmod +x dist/index.js

# Entry command
CMD ["/bin/bash"]
