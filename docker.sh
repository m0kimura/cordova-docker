#!/bin/bash
#
  project=${PWD##*/}
##
  if [[ $1 = "build" ]]; then
    if [[ ! -e $HOME/cordova ]]; then
      mkdir $HOME/cordova
    fi
    docker rm -f fx-${project}
    docker build -t ${project} --build-arg user=$USER .

    xhost local:
    docker run -d --name fx-${project} --label type=local \
      -e DISPLAY=$DISPLAY \
      -e XMODIFIERS=$XMODIFIERS \
      -e XIM=fcitx \
      -e GTK_IM_MODULE=$GTK_IM_MODULE \
      -e QT_IM_MODULE=$QT_IM_MODULE \
      -e LC_TYPE=ja_JP.UTF-8 \
      -e LANG=ja_JP.UTF-8 \
      -e TERM=xterm \
      -v /tmp/.X11-unix:/tmp/.X11-unix \
      -v /dev/shm:/dev/shm \
      -v /home/$USER \
      -v $HOME/cordova:/cordova \
      ${project}
  elif [[ $1 = "stop" ]]; then
    docker stop fx-${project}
  else
    docker start fx-${project}
  fi
##

