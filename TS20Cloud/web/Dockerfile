FROM php:7.2-apache

WORKDIR /var/www/html

RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

RUN apt-get update && apt-get install unzip

RUN curl -LJO https://github.com/wardude202/TS_20-SAE/archive/master.zip

RUN unzip TS_20-SAE-master.zip && rm -rf TS_20-SAE-master.zip

RUN mv TS_20-SAE-master/webdesign/* ./ && rm -rf TS_20-SAE-master

ENV PORT=80

EXPOSE 80
