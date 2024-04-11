FROM ubuntu:20.04

# For building Linux packages
ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Berlin
RUN apt-get update -y
RUN apt-get install rpm build-essential fakeroot devscripts -y

# For node
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash
RUN apt-get install nodejs -y
RUN npm install -g yarn

# Don't run as root
RUN groupadd --gid 1000 builder
RUN useradd --uid 1000 --gid 1000 builder
RUN mkdir /home/builder/
RUN chown 1000:1000 /home/builder/
