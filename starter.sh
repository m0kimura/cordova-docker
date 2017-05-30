#!/bin/bash
##
  if [[ ! -e /cordova/library ]]; then
    cp -r /root/source/* /cordova
  fi
  atom -f /cordova
##
