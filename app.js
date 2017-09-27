/****************************************************************************
 * Luca BICEGO
 * Copyright (c) 2017
 *
 * via San Giorgio, 46
 * 36030 Caltrano (VI) ITALY
 *
 * All rights reserved.
 *
 * NOTE: This sofware module can be reused / distributed with written 
 * authorisation of the copyright holder
 *
 ****************************************************************************/
var path = require("path");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
//Libreria utilizzata per le traduzioni
var i18n=require('i18n-express');
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;
var address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var app = express();
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(process.cwd() + '/public/images'))); // redirect images
app.use('/js', express.static(path.join(process.cwd() + '/node_modules/bootstrap/dist/js'))); // redirect bootstrap JS
app.use('/js', express.static(path.join(process.cwd() + '/node_modules/jquery/dist'))); // redirect JS jQuery
app.use('/js', express.static(path.join(process.cwd() + '/node_modules/popper/dist'))); // redirect JS popper
app.use('/css', express.static(path.join(process.cwd() + '/node_modules/bootstrap/dist/css'))); // redirect CSS bootstrap
app.use(i18n({
  translationsPath: path.join(__dirname, '/public/locales'), // <--- use here. Specify translations files path.
  siteLangs: ["it","en"],
  textsVarName: 'translation'
}));
app.get("/", function(request, response){
      response.render("index");
   });
app.use(function(request, response){
	  response.status(404).render("404");
  });
module.exports=app;  
var listener = app.listen(port, address, function(){
     console.log("MyTrakking app started on address "+address);
     console.log("MyTrakking app started on port "+port);
});  
