To setup the project::

    setup the css to compile the scss 
In the css folder add style.scss 
open a new terminal in the folder layout name (cd into mcp-layout)
sass css/style.scss css/style.css
this will link the style.scss with the css for the scss to run 

    in the terminal run :: 
cd mcp-layout / npx sass css/style.scss css/style.css --watch

    to setup package.json 
in a new terminal :: npm init -y

then install Electron browser for this project 
npm install electron --save-dev (to add Electron)
you need to add "start": "electron ." in the package.json

here is an updated version of package.json 
{
  "name": "dashboard-project",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ." <------- note the update 
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YoRobynYo/Dashboard.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/YoRobynYo/Dashboard/issues"
  },
  "homepage": "https://github.com/YoRobynYo/Dashboard#readme",
  "description": ""
}

    when restarting : 
cd into the project / cd into mcp-layout 
terminal -1 npx sass scss/style.scss css/style.css --watch (for css / style.scss)
terminal -2 npm start 
(this will start the package.json to run electron browser)

    // any errors look here first check the path
sometimes on running npm start you will get a path error 
normally its in the main.js file in here :: 
    win.loadFile(path.join(__dirname, 'index.html')); 
but the file electron is looking for is here :: 
win.loadFile(path.join(__dirname, 'mcp-layout', 'index.html'));
so we have to update the main.js path for electron
this will tell Electron to load the HTML from the correct folder

then restart the electron browser 

    clearing the cache 
in the terminal :: rm -rf node_modules/.cache
then restart your server:

    add git so we have a backup 
cd mcp-layout 
# 1. Initialize Git (if not already done)
git init

# 2. Add your files to staging
git add .

# 3. Commit the files
git commit -m "Initial commit"

# 4. Rename the branch to 'main'
git branch -M main

# 5. Add the remote repo (if not already done)
git remote add origin https://github.com/YoRobynYo/mcp-layout.git

# 6. Push to GitHub
git push -u origin main

# git is now updated 
https://github.com/YoRobynYo/mcp-layout 





