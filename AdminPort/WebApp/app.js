
const express = require("express");
const path = require('path');

//----------------------------------------------------------------------------------------------
//Middle Ware?
//----------------------------------------------------------------------------------------------
const app = express();
app.use(express.json()) //allows parsing of JSON?
app.use(express.static(path.join(__dirname, '/dist'))); //i forget
//Route Packages
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//Main Routes
//----------------------------------------------------------------------------------------------
app.get("/*", (req,res) => { //Serves a Static HTML page as the main route. This should be changed to the react app
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

app.listen("8080", () => {
    console.log(`Server listening on 8080`);
  });