FROM node:20-bookworm
# FROM eclipse-temurin:17-jdk-focal # Use a lightweight Ubuntu base with JDK 17

# 1. Install dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    git curl nodejs npm \
    wget \
    unzip \
    nano \
    && rm -rf /var/lib/apt/lists/*

    # && wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O sdk.zip \

RUN <<EOF cat >> /root/.bashrc
export PS1="\[\e[36m\]\u@docker:\[\e[32m\]\w\[\e[0m\]\$ "
alias ll='ls -al --color'
EOF
# export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
# export PATH=$PATH:$JAVA_HOME/bin


# 2. Setup Android SDK
ENV ANDROID_HOME=/opt/android-sdk
RUN mkdir -p $ANDROID_HOME/cmdline-tools \
    && wget https://dl.google.com/android/repository/commandlinetools-linux-14742923_latest.zip -O sdk.zip \
    && unzip sdk.zip -d $ANDROID_HOME/cmdline-tools \
    && mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
    && rm sdk.zip

ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools


# 3. Accept Licenses and install Build Tools
RUN yes | sdkmanager --licenses \
    && sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" \
        "tools" "emulator" "extras;android;m2repository" "extras;google;m2repository"


# 4. Install NativeScript CLI
RUN npm install -g nativescript


# 5.
RUN npm install -g eas-cli


WORKDIR /app
