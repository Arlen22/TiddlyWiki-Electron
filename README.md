# TiddlyWiki-Electron

Download Electron from http://electron.atom.io/ or https://github.com/electron/electron/releases.

I normally download the zip file and extract the files into a folder called bin. Then I put my TiddlyElectron app in a folder next to it. Then, I put a batch (or bash) file somewhere that calls it with the Tiddlywiki file as the next argument.

My windows batch file looks like this:

    start %~dp0\bin\electron.exe "%~dp0\TWD\electron.js" %1
    
And is stored next to the bin and src (TWD in this case) folders. To open a TiddlyWiki file, I just drag it over the `.bat` file and it opens in Electron.

And the best part is that I have this stored on my dropbox, so if I need it, I can get it anywhere.

## Credits

I use inject.js from TiddlyFox for TiddlyWiki Classic compatibility. For TW5 files, the app uses the TiddlyFox saver that ships with TW5.
