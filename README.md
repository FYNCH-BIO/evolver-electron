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

## Docker Build and Run

Download and install Docker.

  + Linux: check your package manager / distribution instructions.
  + Mac: [Instructions](https://docs.docker.com/docker-for-mac/install/)
  + Windows: [Instructions](https://docs.docker.com/docker-for-windows/install/) (Windows 10) / [Instructions](https://docs.docker.com/toolbox/toolbox_install_windows/) (Windows 7/8)
  
Pull, and Build the image:
```bash
    docker build -t evolver-electron .
    docker run -p 1212:1212 -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY:0 evolver-electron
```

### Docker Additional Requirement
 eVOLVER relies on x11 as a GUI which can be installed following the instructions below and replacing the environmental variable `DISPLAY=$DISPLAY:0` with an appropriate line from `Docker Environmental Variables` sub-section   
 
Macs, can install [xQuartz](https://www.xquartz.org/) with additional configuration [here](https://gist.github.com/cschiewek/246a244ba23da8b9f0e7b11a68bf3285)   
Windows, can install [Cygwin](https://x.cygwin.com/) with additional configuraiton [here](https://www.kombitz.com/2020/01/31/how-to-configure-cygwin-x-for-remote-connection/)   
A restart may be needed after installation, but a test container can be ran via:   
```bash
docker run -p 1212:1212 -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY:0 nonasoftware/evolver-electron:latest
```

### Docker Environmental Variables
```
macOS: -e DISPLAY=docker.for.mac.host.internal:0
Windows: -e DISPLAY=host.docker.internal:0
Linux: --net=host -e DISPLAY=:0
```

## Credit

- [Zachary Heins](https://github.com/zheins)
- [Brandon Wong](https://github.com/brandogw)
- [Electron-React Boilerplate Repo](https://github.com/electron-react-boilerplate/electron-react-boilerplate) - All this work is based on infrastructure from their repo
