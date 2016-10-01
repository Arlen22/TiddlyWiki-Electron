const fs = require('fs');
const path = require('path');

const electron = require('electron');
const remote = electron.remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const clipboard = electron.clipboard;
const shell = electron.shell;

var currentWebContents = remote.getCurrentWebContents();


//no ipc calls needed as this script has full access to the node modules
//regardless of nodeIntegration.
process.once('loaded', function() {
	window.webContents = currentWebContents;
	
	
	
	window.addEventListener('load', function(ev){
		
		
		
		var injectScript = function(doc) {
			var injectCode = fs.readFileSync(path.join(__dirname, 'inject.js'));
			// Inject the script
			var code = doc.createTextNode(injectCode);
			var scr = doc.createElement("script");
			scr.type = "text/javascript";
			scr.appendChild(code);
			doc.getElementsByTagName("head")[0].appendChild(scr)
		};

		var injectMessageBox = function(doc) {
			// Inject the message box
			var messageBox = doc.getElementById("tiddlyfox-message-box");
			if(!messageBox) {
				messageBox = doc.createElement("div");
				messageBox.id = "tiddlyfox-message-box";
				messageBox.style.display = "none";
				doc.body.appendChild(messageBox);
			}
			// Attach the event handler to the message box
			messageBox.addEventListener("tiddlyfox-save-file", onSaveFile,false);
		};

		var onSaveFile = function(event) {
			// Get the details from the message
			var message = event.target,
				filepath = message.getAttribute("data-tiddlyfox-path"),
				content = message.getAttribute("data-tiddlyfox-content");
			// Save the file
			fs.writeFileSync(filepath, content);
			
			fs.writeFileSync(path.join(__dirname, 'backup', path.basename(filepath) ) + '-' + Date.now().toString() + path.extname(filepath), content );
			
			console.log(filepath);
			
			// Remove the message element from the message box
			message.parentNode.removeChild(message);
			// Send a confirmation message
			var event = document.createEvent("Events");
			event.initEvent("tiddlyfox-have-saved-file",true,false);
			event.savedFilePath = filepath;
			message.dispatchEvent(event);
			return false;
		};

		var isTiddlyWikiClassic = function(doc,win) {
			// Test whether the document is a TiddlyWiki (we don't have access to JS objects in it)
			var versionArea = doc.getElementById("versionArea");
			return (doc.location.protocol === "file:") &&
				doc.getElementById("storeArea") &&
				(versionArea && /TiddlyWiki/.test(versionArea.text));
		};

		var isTiddlyWiki5 = function(doc,win) {
			// Test whether the document is a TiddlyWiki5 (we don't have access to JS objects in it)
			var metaTags = doc.getElementsByTagName("meta"),
				generator = false;
			for(var t=0; t<metaTags.length; t++) {
				if(metaTags[t].name === "application-name" && metaTags[t].content === "TiddlyWiki") {
					generator = true;
				}
			}
			return (doc.location.protocol === "file:") && generator;
		};

		var getPageUri = function(doc) {
			return doc.location.protocol + "//" + doc.location.host + doc.location.pathname;
		};
		
		// Get the document and window and uri
		var doc = document,
			win = window,
			uri = getPageUri(doc);
		// Check if this is a TiddlyWiki document
		var isTiddlyWikiClassic = isTiddlyWikiClassic(doc,win),
			isTiddlyWiki5 = isTiddlyWiki5(doc,win),
			approved = false;
		
		if(isTiddlyWikiClassic || isTiddlyWiki5) {
			injectMessageBox(doc); // Always inject the message box
			if(isTiddlyWikiClassic) {
				injectScript(doc); // Only inject the script for TiddlyWiki classic
			}
		}
		
		var linkMenu = new Menu();
		
		

		window.addEventListener('contextmenu', function (e) {
			e.preventDefault();
			console.log(e);
			var menu = new Menu();
			if(e.target.href) {
				menu.append(new MenuItem({ label: 'Copy link address', click: function() { clipboard.writeText(e.target.href); } }));
				menu.append(new MenuItem({ type: 'separator' }));
			}
			menu.append(new MenuItem({ label: 'Inspect Element', click: function() { currentWebContents.inspectElement(e.x, e.y); } }));
			menu.popup(remote.getCurrentWindow());
		}, false);

	});
});
