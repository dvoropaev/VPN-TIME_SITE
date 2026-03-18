#!/usr/bin/bash

npm run build
scp -r ./dist/* root@web.vtime.pro:/var/www/vtime.pro/html/
