/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, Menu  } from 'electron';
import MenuBuilder from './menu';

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};


function createWindow () {
  var position = []
  if (mainWindow) {
    position = mainWindow.getPosition()
  }
  else {
    position = [0,0]
  }
  mainWindow = new BrowserWindow({
    show: false,
    width: 1110,
    height: 666,
    backgroundColor: '#F7F7F7',
    minWidth: 1110,
    minHeight: 666,
    x: position[0]+20,
    y: position[1]+20

  });
  if (process.env.START_FULLSCREEN) {
    mainWindow.setFullScreen(true);
  }
  mainWindow.setMenu(null);
  mainWindow.loadURL(`file://${__dirname}/app.html`);
  // mainWindow.webContents.openDevTools()

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', function(e){
    var choice = require('electron').dialog.showMessageBox(this,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit? Any running scripts will be terminated.'
       });
       if(choice == 1){
         e.preventDefault();
       }
    });


   if (!process.env.START_FULLSCREEN) {
     const menuBuilder = new MenuBuilder(mainWindow);
     const template = menuBuilder.buildMenu();
     // template[1].submenu[0] = {
     //     label: 'New Window',
     //     accelerator: 'Command+N',
     //     click: () => {
     //       createWindow()
     //     }
     //   }
     const menu = Menu.buildFromTemplate(template);
     
     Menu.setApplicationMenu(menu);
   }
 }


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  createWindow ()
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});

app.setAboutPanelOptions({
  copyright: "Copyright © 2019 Fynch Biosciences Inc."
});
