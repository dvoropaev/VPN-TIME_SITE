#!/usr/bin/bash

npm run build
scp -r ./dist/* root@web-ihor.vtime.pro:/var/www/vtime.pro/html/
