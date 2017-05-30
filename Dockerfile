FROM m0kimura/ubuntu-base

ARG user=${user:-docker}
RUN apt-get update && \
    echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
    add-apt-repository -y ppa:webupd8team/java && \
    apt-get update && \
    apt-get install -y oracle-java8-installer && \

    apt-get install -y sudo ant lib32stdc++6 lib32z1 && \
    npm install -g cordova && \
    cd /usr/local && \
    wget http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz && \
    tar zxvf android-sdk_r24.4.1-linux.tgz && \

    rm -rf /var/cache/oracle-jdk8-installer && \
    rm -rf /usr/local/android-sdk_r24.4.1-linux.tgz

ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV ANDROID_HOME /usr/local/android-sdk-linux
ENV PATH $ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:/home/${user}/tools:$PATH

RUN echo y | android update sdk --no-ui --all --filter "android-23,build-tools-23.0.3" && \
    echo y | android update sdk --no-ui --all --filter "extra-google-m2repository,extra-android-m2repository"

ENV TERM=xterm
RUN apt-get -qq install \
      curl \
      ca-certificates \
      libgtk2.0-0 \
      libxtst6 \
      libnss3 \
      libgconf-2-4 \
      libasound2 \
      fakeroot \
      gconf2 \
      gconf-service \
      libcap2 \
      libnotify4 \
      libxtst6 \
      libnss3 \
      gvfs-bin \
      xdg-utils \
      composer \
      libxss1 \
      libcanberra-gtk-module \
      libxkbfile1 \
      python -qq -y --allow-unauthenticated --no-install-recommends && \
    curl -L https://github.com/atom/atom/releases/download/v1.16.0/atom-amd64.deb > /tmp/atom.deb && \
    dpkg -i /tmp/atom.deb && \
    rm -f /tmp/atom.deb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY atom /home/${user}/.atom/
COPY starter.sh /home/${user}/starter.sh
RUN chown -R ${user}:${user} /home/${user} && \
    cd /root && git clone https://github.com/m0kimura/cordova.git source && \
    chown -R ${user}:${user} /root/source
VOLUME /home/${user}
VOLUME /cordova
WORKDIR /home/${user}
USER ${user}
CMD ./starter.sh

