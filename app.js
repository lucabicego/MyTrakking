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
//Per la gestione dell'https
var https=require("https");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
//Libreria utilizzata per le traduzioni
var translation= require("i18n");
var flash = require("connect-flash");
//Libreria per effettuare l'autenticazione
var passport = require("passport");
//Per poter leggere i file dei certificati
var fs=require("fs");
//Per le interrogazioni al db
var MyMongo=require('./public/mymodules/mymongodb.js');
var setUpPassport = require("./public/mymodules/setuppassport.js");
var portHTTPS = process.env.PORT || 8080;
var portHTTP = process.env.PORT || 3000;
var address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var app = express();
https.createServer(
    {
	   key: fs.readFileSync(path.join(process.cwd() +"/public/certificati/privkey.pem")),
	   cert: fs.readFileSync(path.join(process.cwd() +"/public/certificati/pubcert.pem"))
	},app).listen(portHTTPS, address, function()
	{
      console.log("MyTrakking https app started on address "+address);
      console.log("MyTrakking https app started on port "+portHTTPS);
    });  
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
//Queste due direttive servono per effettuare il parsing json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/images', express.static(path.join(process.cwd() + '/public/images'))); // redirect images
app.use('/js', express.static(path.join(process.cwd() + '/node_modules/bootstrap/dist/js'))); // redirect bootstrap JS
app.use('/js', express.static(path.join(process.cwd() + '/node_modules/jquery/dist'))); // redirect JS jQuery
app.use('/js', express.static(path.join(process.cwd() + '/node_modules/popper/dist'))); // redirect JS popper
app.use('/js', express.static(path.join(process.cwd() + '/public/mymodules'))); // Definizione di moduli JS personali
app.use('/css', express.static(path.join(process.cwd() + '/node_modules/bootstrap/dist/css'))); // redirect CSS bootstrap
//Inizializzazione libreria traduzioni
translation.configure({
   //define how many languages we would support in our application
   locales:['it', 'en'],
   //define the path to language json files, default is /locales
   directory: path.join(__dirname, '/public/locales'),
   //define the default language
   defaultLocale: 'it',
   // define a custom cookie name to parse locale settings from 
   cookie: 'translation'
});
app.use(translation.init);
//Imposta l'utilizzo dei cookies
app.use(cookieParser());
//Qui si imposta la sessione e i valori da passare
app.use(session({
   secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
   resave: true,
   saveUninitialized: true,
   cookie:{maxAge: 60000}
}));
//Imposta l'utilizzo di flash
app.use(flash());
//Inizializza passport per l'autenticazione
setUpPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(function(request, response, next) {
   response.locals.currentUser = request.user;
   response.locals.errors = request.flash("error");
   response.locals.infos = request.flash("info");
   next();
});
//Pagina principale 
app.get("/", function(request, response){
	  if(request.cookies.translation == undefined)
	  {
         //Crea un Cookie con la lingua italiana		 
	     response.cookie('translation','it');
	     response.setLocale('it');
	  }	 
      else
      {
	     response.setLocale(request.cookies.translation);
	  }
	  if(request.user == undefined)
	  {
		 //Fai comparire la pagina iniziale di mytrakking per utente non profilato
         response.render("index",{translation:response});
	  }
      else
      {
		 //Fai comparire la pagina che mostra la posizione ei percorsi vicini 
         response.render("main",{translation:response});
	  }		  
   });
//Pagina per il LogIn
app.get("/signup", function(request, response) {
   response.setLocale(request.cookies.translation);
   response.render("signup",{translation:response});
});
//Questo viene eseguito dopo il login
//Verifica se l'utente è già presente in archivio, nel qual caso fa comparire un errore
//Salva in archivio il nuovo utente
//Effettua l'autenticazione dell'utente
app.post("/signup", function(request, response, next) 
   {
      var username = request.body.username;
      var password = request.body.password;
	  //Verifica che non ci sia già l'utente, altrimenti lo salva
      MyMongo.User.findOne({ username: username }, 
      function(err, user) 
	  {
         if (err) 
	     { 
            return next(err); 
	     }
	     //Ritorna dall'interrogazione un utente 
         if (user) 
	     {
			//Utente esiste gia'  
            request.flash("error", translation.__("ERRORE-03"));
            return response.redirect("/signup");
         }
	     //Salva il nuovo utente
         var newUser = new MyMongo.User({username: username,password: password});
         newUser.save(next);
      });
   }, 
   passport.authenticate("login", {successRedirect: "/",failureRedirect: "/signup",failureFlash: true})
   );
//Eseguito dopo il login   
app.post("/login",passport.authenticate("login", {successRedirect: "/",failureRedirect: "/login",failureFlash: true}));  
app.get("/logout", function(request, response){
	request.logout();
    response.redirect("/");
}); 
//Pagina Info   
app.get("/info", function(request, response){
	  response.setLocale(request.cookies.translation);
      response.render("info",{translation:response});
   });
//Pagina Elenco Percorsi   
app.get("/elencoPercorsi", function(request, response){
	  response.setLocale(request.cookies.translation);
      response.render("elencoPercorsi",{translation:response});
   });
//Pagina dettagli Percorso
app.get("/CaltranoSunioCostola", function(request, response){
	  response.setLocale(request.cookies.translation);
      response.render("CaltranoSunioCostola",{translation:response});
   });
app.get("/NovegnoPriafora", function(request, response){
	  response.setLocale(request.cookies.translation);
      response.render("NovegnoPriafora",{translation:response});
   });
//Pagina cambio Lingua Italiana
app.get("/it", function(request, response){
	  translation.setLocale('it');
	  response.cookie('translation','it');
      response.redirect('/');
   });
//Pagina cambio Lingua Inglese
app.get("/en", function(request, response){
	  translation.setLocale('en');
	  response.cookie('translation','en');
      response.redirect('/');
   });
//Riceve una richiesta per le coordinate
app.post('/getGeoPoints', function(req, res){
	var dataReq=req.body;
	MyMongo.QueryData(dataReq , res);
}); 
app.post('/getGeoTrace', function(req, res){
	var dataReq=req.body;
	MyMongo.QueryArrayData(dataReq , res);
}); 
//Pagina messaggio di Errore   
app.use(function(request, response){
	  response.setLocale(request.cookies.translation);
	  response.status(404).render("404",{translation:response});
});
var listener = app.listen(portHTTP, address, function(){
     console.log("MyTrakking app started on address "+address);
     console.log("MyTrakking app started on port "+portHTTP);
});  
