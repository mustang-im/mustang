#!/usr/bin/env bash

# Run from /mobile

# Replace Android icons
cp -R parula/android/* android/app/src/main/res

# Relace all appName in /mobile
perl -p -i \
  -e "s|im.mustang.capa|com.beonex.parula|;" \
  -e "s|"Mustang"|"Parula"|;" \
  ./capacitor.config.ts
