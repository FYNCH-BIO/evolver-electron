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
var fs = require('fs');
const http = require('https');
const Store = require('electron-store');
const { exec } = require("child_process");
const { dialog } = require('electron')
const { PythonShell } = require('python-shell');

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

var isWin = process.platform === "win32";

/* Get array of running experiments from exptMap. Store path and pid information only. */
function storeRunningExpts() {
  var runningExpts = Object.keys(exptMap).reduce(function(obj, x) {
    var data = {
      path: x,
      pid: exptMap[x].childProcess.pid
    };
    obj.push(data);
    return obj;
  }, []);
  console.log('updating electron store');
  store.set('running_expts', runningExpts);
  console.log(store.get('running_expts'));
};

/* Handle startup of a python shell instance to run the DPU */
function startPythonExpt(exptDir, flag) {
  var scriptName = path.join(exptDir, 'eVOLVER.py');
  var pythonPath = path.join(store.get('dpu-env'), 'bin', 'python3');
  if (isWin) {
    pythonPath = path.join(store.get('dpu-env'), 'Scripts', 'python');
  }
  var options = {
      mode: 'text',
      pythonPath: pythonPath,
      args: flag
    };
  var pyShell = new PythonShell(scriptName, options);
  pyShell.on('message', function(message) {
    console.log(message);
  });
  exptMap[exptDir] = pyShell;
  var pid = pyShell.childProcess.pid;
  pyShell.on('close', function() {
    console.log('eVOLVER script with PID ' + pid + ' closed.');
     delete exptMap[exptDir];
     storeRunningExpts();
     mainWindow.webContents.send('running-expts',Object.keys(exptMap));
  });
  storeRunningExpts();
  mainWindow.webContents.send('running-expts',Object.keys(exptMap));
}

function startPythonCalibration(calibrationName, ip, fitType, fitName, params) {
    var scriptName = path.join(app.getPath('userData'), 'calibration', 'calibrate.py');
    var pythonPath = path.join(store.get('dpu-env'), 'bin', 'python3');
    if (isWin) {
        pythonPath = path.join(store.get('dpu-env'), 'Scripts', 'python');
    }
    var options = {
        mode: 'text',
        pythonPath: pythonPath,
        args: ['--always-yes',
                '--no-graph',
                '-a', ip,
                '-n', calibrationName,
                '-f', fitName,
                '-t', fitType,
                '-p', params]
    }
    var pyShell = new PythonShell(scriptName, options);
    pyShell.on('close', function() {
        console.log('Calibration finished for ' + calibrationName);
        mainWindow.webContents.send('calibration-finished', calibrationName);
    })
}

/* Handle killing and relaunching experiments not connected to application. */
function killExpts(relaunch) {
  var running_expts_copy = []
  for (var i = 0; i < store.get('running_expts').length; i++) {
    running_expts_copy.push(store.get('running_expts')[i]);
  }
  store.set('running_expts', []);
  for (var i = 0; i < running_expts_copy.length; i++) {
    ps.lookup({pid: running_expts_copy[i].pid}, function(err, resultList) {
      if (err) {
        throw new Error(err);
      }
      if (resultList.length === 0) {
        return;
      }
      var expt_process = resultList[0];
      for (var i = 0; i < expt_process.arguments.length; i++) {
        if (expt_process.arguments[i].includes('eVOLVER.py')) {
          ps.kill(expt_process.pid, function(err) {
            if (err) {
              throw new Error(err);
            }
            else {
              console.log('Process %s has been killed!', expt_process.pid);
            }
          });
          break;
        }
      }
    });
    if (relaunch) {
      console.log("Relaunching")
      startPythonExpt(running_expts_copy[i].path, '--always-yes');
    }
  }
}

ipcMain.on('start-script', (event, arg) => {
    console.log(arg);
  startPythonExpt(arg, '--always-yes');
});

ipcMain.on('stop-script', (event, arg) => {
   exptMap[arg].send('stop-script');
   // Wait 3 seconds for the commands to be sent to stop the pumps before killing the process
   setTimeout(() => {
       exptMap[arg].childProcess.kill();
       delete exptMap[arg];
       storeRunningExpts();
       mainWindow.webContents.send('running-expts',Object.keys(exptMap));}, 3000);

});

ipcMain.on('start-calibration', (event, experimentName, ip, fitType, fitName, params) => {
    startPythonCalibration(experimentName, ip, fitType, fitName, params);
});

ipcMain.on('running-expts', (event, arg) => {
   mainWindow.webContents.send('running-expts',Object.keys(exptMap));
});

ipcMain.on('active-ip', (event, arg) => {
  mainWindow.webContents.send('get-ip', arg);
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
    y: position[1]+20,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (process.env.START_FULLSCREEN) {
    mainWindow.setFullScreen(true);
  }
  mainWindow.setMenu(null);
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // Uncomment to view dev tools on startup.
  //mainWindow.webContents.openDevTools();

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

/*
setAboutPanelOptions() only available for macOS
app.setAboutPanelOptions({
  copyright: "Copyright © 2019 Fynch Biosciences Inc."
});*/
