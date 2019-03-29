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
import { ipcMain, app, BrowserWindow, Menu  } from 'electron';
import MenuBuilder from './menu';

let mainWindow = null;

/*
 * Ipc communication so background windows can talk to the renderer.
 * 
 */ 

var backgroundShells = [];
var tasks = [];
var available = [];
var maxShells = 5;

var exptMap = {};
var pausedExpts = [];

function makeBackgroundShell() {
    if (backgroundShells.length >= maxShells) {
        return;
    }
    var pyshellWindow = new BrowserWindow({show:false, nodeIntegrationInWorker: true});
    pyshellWindow.loadURL('file://' + __dirname + '/' + 'background.html');
    pyshellWindow.on('closed', () => {
        console.log('bg window closed');
    });    
}

function runPyshells() {
    if (available.length === 0) {
        makeBackgroundShell();
    }
    while (available.length > 0 && tasks.length > 0) {
        var task = tasks.shift();
        if (task.length === 3) {
            var pyShell = available.shift();
            pyShell.send(task[0], task[1]);
            exptMap[task[2]] = pyShell;
            
        }
        else {
            available.shift().send(task[0], task[1]);
        }
        if (available.length === 0 && tasks.length > 0) {
            makeBackgroundShell();
        }
    }
}

ipcMain.on('for-renderer', (event, arg) => {
    mainWindow.webContents.send(arg[0], arg[1]);
});

ipcMain.on('start-script', (event, arg) => {
    tasks.push([arg[0], arg[1], arg[2]]);
    runPyshells();
});

ipcMain.on('send-message', (event, arg) => {  
   var recipientShell = exptMap[arg[0]];
   recipientShell.send(arg[1], arg[2]);   
});

ipcMain.on('pause-script', (event, arg) => {
   var recipientShell = exptMap[arg];
   recipientShell.send('pause-script');
   pausedExpts.push(arg);
});

ipcMain.on('continue-script', (event, arg) => {
   var recipientShell = exptMap[arg];
   recipientShell.send('continue-script');
   for (var i = 0; i < pausedExpts.length; i++) {
       if (pausedExpts[i] === arg) {
           pausedExpts.splice(i, 1);
       }
   }    
});

ipcMain.on('stop-script', (event, arg) => {
   var recipientShell = exptMap[arg];
   recipientShell.send('stop-script');
   delete exptMap[arg];
   for (var i = 0; i < pausedExpts.length; i++) {
       if (pausedExpts[i] === arg) {
           pausedExpts.splice(i, 1);
       }
   }    
});

ipcMain.on('running-expts', (event, arg) => {
   mainWindow.webContents.send('running-expts',Object.keys(exptMap)); 
});

ipcMain.on('paused-expts', (event, arg) => {
   mainWindow.webContents.send('paused-expts', pausedExpts);
});

ipcMain.on('ready', (event, arg) => {
    if (!backgroundShells.includes(event.sender)) {
        backgroundShells.push(event.sender);
    }
    
    // remove the thread from the expt map
    console.log(arg);
    console.log(exptMap[arg]);
    delete exptMap[arg];
    
    available.push(event.sender);
    runPyshells();
});

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
    resizable: false,
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
