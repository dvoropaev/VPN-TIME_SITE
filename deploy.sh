#!/usr/bin/bash

npm run build
scp -r ./dist/* root@web-4vps.vtime.pro:/var/www/vtime.pro/html/
