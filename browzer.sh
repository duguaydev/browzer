#!/bin/bash
export GDK_BACKEND=x11
export WEBKIT_DISABLE_COMPOSITING_MODE=1

yad --html --browser --width=1800 --height=900 --title="View HTML" --uri="http://localhost:3000/" \
    --button="Terminal:sh -c 'file=$(curl -s http://localhost:3000/api/get-file-path | jq -r .filePath); alacritty -e nano $file'" \
    --button="Switch:6" --button="Switch:7" --button="Switch:8" 