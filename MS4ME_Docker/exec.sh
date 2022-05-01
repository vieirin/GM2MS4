#!/usr/bin/env bash

NAME=ms4me
IP_ADDRESS=$(ifconfig en0 | grep "inet " | cut -d " " -f 2)
DISPLAY="$IP_ADDRESS:0"

startContainerOSX() {
    APP=socat
    brew ls --versions $APP > /dev/null 2>&1 || brew install $APP
    APP=xquartz
    brew ls --cask --versions $APP > /dev/null 2>&1 || brew install --cask $APP
    
    sudo /opt/X11/bin/xhost + $IP_ADDRESS
    open -a XQuartz
    docker run -d \
    --rm --network host \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -e DISPLAY=$DISPLAY $NAME
}

buildContainer() {
    EXISTING_IMAGE_ID=$(docker ps --all --filter "name=$NAME" --format "{{.Image}}")
    
    if [[ -n "$EXISTING_IMAGE_ID" ]]; then
        docker stop $NAME > /dev/null 2>&1
        docker rm -f $NAME > /dev/null 2>&1
        docker rmi -f $EXISTING_IMAGE_ID
    else
        echo "$NAME does not exist, creating..."
    fi
    
    IMAGE_TAG="ms4me:latest"
    # Build your docker container
    docker build . -t $IMAGE_TAG
    
    IMAGE_ID=$(docker images --format "{{.ID}}" $IMAGE_TAG)
    
    echo "Creating container using image ID $IMAGE_ID, mapping IP address $IP_ADDRESS, Display $DISPLAY and mounting $CODE_DIR..."
    CREATED_ID=$(docker create -it -e DISPLAY=$DISPLAY $IMAGE_TAG)
    
    GENERATED_NAME=$(docker ps --all --filter "id=$CREATED_ID" --format "{{.Names}}")
    echo "Renaming $GENERATED_NAME to $NAME..."
    docker rename $GENERATED_NAME $NAME
    
    echo "\nContainer created, run ./start"
}

$1