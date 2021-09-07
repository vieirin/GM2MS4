# gm2ms4

## Running this project

### VSCode

To run this project in development mode open the project on a vscode window, build the devcontainer that it'll offers you to build.

After building the development enviroment the window should load inside the built docker image, no futher configuration is necessary, the needed extensions goes along the instalation! 😺

Then start the live server

```bash
yarn build:live
```

Everytime a file changes the nodemon process will recompile the code and restart the process, no need to be running a command again and again.

### VSCode debugging

Also as a feature from the node inspector mode you can attach your debug environment at any time to the nodemon process, just hit `f5` on a vscode window and select the proper process (it may contain the string `yarn build:live` on its description)
