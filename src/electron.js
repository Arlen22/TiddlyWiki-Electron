/*
https://github.com/atom/electron/blob/master/docs/api/dialog.md


*/

const electron = require('electron');
const app = electron.app;
const path = require('path');
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;

var ipc = electron.ipcMain;
var mainWindow = null;

console.log(process.argv);

var arg2 = process.argv[2];


app.on('ready', function() {
	
	var file = arg2 ? arg2 : electron.dialog.showOpenDialog({ properties: [ 'openFile' ]});
	
	if(!file) process.exit(0);
	
	file = path.resolve(file);
	
	mainWindow = new BrowserWindow({
		width: 1280, 
		height: 720,
		webPreferences: {
			nodeIntegration: false
		},
		preload: path.join( __dirname, 'preload-tw5.js')
	});

	mainWindow.loadURL('file:///' + file);

	mainWindow.on('closed', function() {
		mainWindow = null;
	});
	
	//mainWindow.webContents.openDevTools();	
	//mainWindow.webContents.elTW5File = file;
	mainWindow.maximize();
	mainWindow.webContents.on('new-window', function(event, url){
	  //console.log(event);
	  event.preventDefault();
	  shell.openExternal(url);
	});
});
ipc.on('log', function(event){
	var args = [];
	for(var i in arguments) args.push(arguments[i]);
	console.log.apply(console, args.slice(1));
});
