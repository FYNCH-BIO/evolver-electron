## About
A desktop app created to control the basic functions of the eVOLVER and perform calibrations via a GUI.
## Setup

This application uses the yarn package manager. Visit https://classic.yarnpkg.com/en/docs/install#debian-stable for additional information on installing yarn on your computer. The documentation also includes OS specific installation instructions under 'Alternatives'. Note that development of this application was done using Yarn 1 and not Yarn 2.  


## Install
- **If you have installation or compilation issues with this project, please see [the debugging guide](https://github.com/chentsulin/electron-react-boilerplate/issues/400)**

Download the latest release for your OS [here](https://github.com/FYNCH-BIO/evolver-electron/releases)

After installing on your computer, start the app. Add your eVOLVER to the app by clicking the '+' in the lower right hand corner and inputting your eVOLVER IP (found in upper right hand corner of your eVOLVER screen).

## Compiling and Installing
If you need to compile the app before installation, follow these instructions.

Install dependencies with yarn.

```bash
$ cd your_directory/evolver-electron
$ yarn
```

### Run

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
$ yarn dev
```
### Github

Use the command line to commit to the repo, using the Github App will throw errors:

```bash
git add .
git commit -a --no-verify -m "Put comment here"
```

## Packaging

To package for only your local platform:
```bash
$ yarn package
```

To package apps for all platforms:

```bash
$ yarn package-all
```

To package app for Raspberry Pi, first simulate Pi with Docker container:

```bash
docker run --rm -ti  --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_')  --env ELECTRON_CACHE="/root/.cache/electron" --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder"  -v ${PWD}:/project  -v ${PWD##*/}-node-modules:/project/node_modules  -v ~/.cache/electron:/root/.cache/electron  -v ~/.cache/electron-builder:/root/.cache/electron-builder  electronuserland/builder:wine
```

Install dependencies again in environment. Remember to reinstall dependences for local platforms after exiting Docker.:

```bash
$ yarn
```

Package for Raspberry Pi:

```bash
$ yarn package-rpi
```

Next, scp the file to the Raspberry Pi:

```bash
$ scp release/evolver-electron-1.0.0.AppImage pi@<RPI_IP>:~/evolver-electron-1.0.0.AppImage-new
```

NOTE: Do not directly overwrite the file - add `-new` to the end so that it copies next to the current build.

Now ssh to the Raspberry Pi, backup the old version and replace it with the new. Restart the raspberry pi to finish the installation.

```bash
$ ssh pi@<RPI_IP>
$ mv evolver-electron-1.0.0.AppImage evolver-electron-1.0.0.AppImage-old
$ mv evolver-electron-1.0.0.AppImage-new evolver-electron-1.0.0.AppImage
$ sudo reboot now
```

## Credit

- [Zachary Heins](https://github.com/zheins)
- [Brandon Wong](https://github.com/brandogw)
- [Electron-React Boilerplate Repo](https://github.com/electron-react-boilerplate/electron-react-boilerplate) - All this work is based on infrastructure from their repo
