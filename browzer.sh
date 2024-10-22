#!/bin/bash
export GDK_BACKEND=x11
export WEBKIT_DISABLE_COMPOSITING_MODE=1

yad --html --browser --width=900 --height=600 --title="View HTML" --uri="http://localhost:3000/" --button="Switch:4" --button="Switch:6" --button="Switch:7" --button="Switch:8" 