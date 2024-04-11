FROM ubuntu:latest

# For building Windows installer
RUN dpkg --add-architecture i386 && apt-get update -y
RUN apt-get install wine wine32 -y
#RUN apt-get install winetricks -y
#RUN winetricks dotnet45

# For node
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash
RUN apt-get install nodejs -y
RUN npm install -g yarn

# Don't run as root
RUN groupadd --gid 1000 builder
RUN useradd --uid 1000 --gid 1000 builder
RUN mkdir /home/builder/
RUN chown 1000:1000 /home/builder/
