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
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
//Libreria utilizzata per le traduzioni
var translation= require("i18n");
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
//Inizializzazione libreria traduzioni
translation.configure({
   //define how many languages we would support in our application
   locales:['it', 'en'],
   //define the path to language json files, default is /locales
   directory: path.join(__dirname, '/public/locales'),
   //define the default language
   defaultLocale: 'en',
   // define a custom cookie name to parse locale settings from 
   cookie: 'translation'
});
//Imposta l'utilizzo dei cookies
app.use(cookieParser("i18n_demo"));
app.use(session({
   secret: "i18n_demo",
   resave: true,
   saveUninitialized: true,
   cookie:{maxAge: 60000}
}));
app.use(translation.init);
//Imposta l'utilizzo di flash
app.use(flash());
//Pagina principale
app.get("/", function(request, response){
	  if(request.cookies.translation == undefined)
	  {
         console.log("Cookies not set");
         //Crea un Cookie con la lingua italiana		 
	     response.cookie('translation','it');
	     response.setLocale('it');
	  }	 
      else
      {
         console.log("Cookies :"+request.cookies.translation);		  
	     response.setLocale(request.cookies.translation);
	  }	
      response.render("index",{translation:response});
   });
//Pagina Info   
app.get("/info", function(request, response){
	  response.setLocale(request.cookies.translation);
      response.render("info",{translation:response});
   });
//Pagina cambio Lingua Italiana
app.get("/it", function(request, response){
	  response.cookie('translation','it');
      response.redirect('/');
   });
//Pagina cambio Lingua Inglese
app.get("/en", function(request, response){
	  response.cookie('translation','en');
      response.redirect('/');
   });
//Pagina messaggio di Errore   
app.use(function(request, response){
	  response.status(404).render("404");
  });
module.exports=app;  
var listener = app.listen(port, address, function(){
     console.log("MyTrakking app started on address "+address);
     console.log("MyTrakking app started on port "+port);
});  
