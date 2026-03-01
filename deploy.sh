#!/usr/bin/bash

npm run build
scp -r ./dist/* root@www.vtime.pro:/var/www/vtime.pro/html/
