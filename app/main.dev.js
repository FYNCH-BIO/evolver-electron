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

/* Constants for indexing commands for ps.lookup */
const ZERO = 3;
const OVERWRITE = 5;
const CONTINUE = 7;
const PARAMETERS = 9;
const EVOLVERIP = 11;
const EVOLVERPORT = 13;
const NAME = 15;
const BLANK = 17;

var path = require('path');
var ps = require('ps-node');
const Store = require('electron-store');
const { exec } = require("child_process");
const { dialog } = require('electron')

const store = new Store({
  defaults:{
    running_expts: [],
    first_visit: null
  }
});
var backgroundShells = [];
var tasks = [];
var available = [];
var maxShells = 5;

var exptMap = {};
var activeIp = '';

/* Generate browser window for an experiment */
function makeBackgroundShell() {
    if (backgroundShells.length >= maxShells) {
        return;
    }
    var pyshellWindow = new BrowserWindow({show:false, nodeIntegrationInWorker: true});
    pyshellWindow.loadURL('file://' + __dirname + '/' + 'background.html');
    //Uncomment to open dev tools for background shells
    pyshellWindow.webContents.openDevTools()
    pyshellWindow.on('closed', () => {
    });
}

/* Manage the launching of background shells for experiments and handling of experiment arguments */
function runPyshells() {
    if (available.length === 0) {
        makeBackgroundShell();
    }
    while (available.length > 0 && tasks.length > 0) {
        var task = tasks.shift();
        var pyShell = available.shift();
        exptMap[task[1].scriptDir] = {
          browser_contents: pyShell,
          pid: null
        };
        pyShell.send(task[0], task[1]);
        if (available.length === 0 && tasks.length > 0) {
            makeBackgroundShell();
        }
    }
    mainWindow.webContents.send('running-expts', Object.keys(exptMap));
}

/* Get array of running experiments from exptMap. Store path and pid information only. */
function storeRunningExpts() {
  var runningExpts = Object.keys(exptMap).reduce(function(obj, x) {
    var data = {
      path: x,
      pid: exptMap[x].pid
    };
    obj.push(data);
    return obj;
  }, []);
  console.log('updating electron store');
  store.set('running_expts', runningExpts);
  console.log(store.get('running_expts'));
};

/* Handle killing and relaunching experiments not connected to application. */
function killExpts(relaunch) {
  for (var i = 0; i < store.get('running_expts').length; i++) {
    ps.lookup({pid: store.get('running_expts')[i].pid}, function(err, resultList) {
      if (err) {
        throw new Error(err);
      }
      var process = resultList[0];
      for (var i = 0; i < process.arguments.length; i++) {
        if (process.arguments[i].includes('eVOLVER')) {
          ps.kill(process.pid, function(err) {
            if (err) {
              throw new Error(err);
            }
            else {
              console.log('Process %s has been killed!', process.pid);
            }
          });
          break;
        }
      }
    });
    if (relaunch) {
      console.log("Relaunching")
      tasks.push(['start', {
        scriptDir: store.get('running_expts')[i].path,
        flag: '--exp-recover'}
      ]);
    };
  };
  store.set('running_expts', []);
  if (relaunch) {
    runPyshells();
  }
};

ipcMain.on('for-renderer', (event, arg) => {
    mainWindow.webContents.send(arg[0], arg[1]);
});

ipcMain.on('start-script', (event, arg) => {
    tasks.push(['start', {
      scriptDir: arg,
      flag: '--always-yes'}
      ]);
    runPyshells();
});

ipcMain.on('send-message', (event, arg) => {
   var recipientShell = exptMap[arg[0]].browser_contents;
   recipientShell.send(arg[1], arg[2]);
});

ipcMain.on('stop-script', (event, arg) => {
   var recipientShell = exptMap[arg].browser_contents;
   recipientShell.send('stop-script');
   delete exptMap[arg];
   storeRunningExpts();
   mainWindow.webContents.send('running-expts',Object.keys(exptMap));
});

ipcMain.on('close', (event, arg) => {
  var exptMapKeys = Object.keys(exptMap);
  for (var i = 0; i < exptMapKeys.length; i++) {
    if (exptMap[exptMapKeys[i]].pid === arg) {
      delete exptMap[exptMapKeys[i]];
      storeRunningExpts();
      mainWindow.webContents.send('running-expts', Object.keys(exptMap));
      break;
    }
  }
});

ipcMain.on('running-expts', (event, arg) => {
   mainWindow.webContents.send('running-expts',Object.keys(exptMap));
});

ipcMain.on('ready', (event, arg) => {
    if (!backgroundShells.includes(event.sender)) {
        backgroundShells.push(event.sender);
    }

    // remove the thread from the expt map
    delete exptMap[arg];
    storeRunningExpts();
    available.push(event.sender);
    runPyshells();
});

ipcMain.on('active-ip', (event, arg) => {
  mainWindow.webContents.send('get-ip', arg);
  });

ipcMain.on('store-pid', (event, arg) => {
  exptMap[arg[0]].pid = arg[1];
  storeRunningExpts();
});

ipcMain.on('kill-expts', (event, arg) => {
  killExpts(arg.relaunch);
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
  var position = [];
  if (mainWindow) {
    position = mainWindow.getPosition();
  }
  else {
    position = [0,0];
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
    if (store.get('running_expts').length > 0) {
      var runningExpts = [];
      var message = '';
      var detail = '';

      for (var i = 0; i < store.get('running_expts').length; i++) {
        var temp = store.get('running_expts')[i].path;
        runningExpts.push(temp.split('/').pop())
      };
      message = 'The following running experiments have been detected and will persist if the application is closed. Would you still like to close the application?';
      detail = runningExpts.join('\n');

      var choice = dialog.showMessageBox(this,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: message,
          detail: detail
          });
    };
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
   };
 };


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
  };
  store.set('first_visit', null);
  createWindow ();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  };
});

app.setAboutPanelOptions({
  copyright: "Copyright © 2019 Fynch Biosciences Inc."
});
