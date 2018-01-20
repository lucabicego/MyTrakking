/****************************************************************************
 * Luca BICEGO
 * Copyright (c) 2017-2018
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
var express = require("express");
var path = require("path");
//Per la gestione dell'https
var https=require("https");
var http = require('http');	
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
//Per creare nomi di file temporanei
var crypto = require('crypto');
//Per le interrogazioni al db
var MyMongo=require(path.join(process.cwd() + '/public/mymodules/mymongodb.js'));
var setUpPassport = require(path.join(process.cwd() + '/public/mymodules/setuppassport.js'));
//**********************************************************************************************************************
function webServer() 
{
    initWebServer();
	this.initRouting();    
}
//**********************************************************************************************************************
/*
   Inizializzazione percorsi, traduzioni, sessioni e rendering pagine ejs
*/
function initWebServer() 
{
    app = express(); //HTTP
    //reg expression to replace path backslash with the opposite (depending on OS)
    var rgReplace = new RegExp('/', 'g');
    app.set("views", path.resolve(process.cwd() +"/views"));
    app.set("view engine", "ejs");
    app.use(logger("dev"));
    //Queste due direttive servono per effettuare il parsing json
	app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({
       limit: '50mb',
       extended: false,
       parameterLimit:50000
    }));	
    //app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
	//Definizione dei percorsi dei moduli
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
      directory: path.join(process.cwd() +'/public/locales'),
      //define the default language
      defaultLocale: 'it',
      //define a custom cookie name to parse locale settings from 
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
}
//**********************************************************************************************************************
/*
   Definizione del routing delle pagine
*/
webServer.prototype.initRouting = function() 
{
    //========= PAGES ===================
	//Per CORS
    app.all('/*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    })
    //Pagina principale 
    app.get("/", function(request, response)
	{
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
		  //Fai comparire la pagina iniziale di mytrekking per utente non profilato
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
   //Pagina per modificare le impostazioni del profilo utente 
   app.get("/signedit", ensureAuthenticated, function(request, response) {
      response.setLocale(request.cookies.translation);
      response.render("signedit",{translation:response});
   });
   //Questo viene eseguito dopo il signup
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
       },passport.authenticate("login", {successRedirect: "/",failureRedirect: "/signup",failureFlash: true})
    );
    //Eseguito dopo il login   
    app.post("/login",passport.authenticate("login", {successRedirect: "/",failureRedirect: "/login",failureFlash: true}));  
    app.get("/logout", function(request, response)
	   {
	      request.logout();
          response.redirect("/");
    }); 
    //Pagina Info   
    app.get("/info", function(request, response)
	   {
	      response.setLocale(request.cookies.translation);
          response.render("info",{translation:response});
    });
    //Pagina Elenco Percorsi   
    app.get("/elencoPercorsi", function(request, response)
	   {
	      response.setLocale(request.cookies.translation);
          response.render("elencoPercorsi",{translation:response});
    });
    //Pagina dettagli Percorso
    app.get("/CaltranoSunioCostola", function(request, response)
	   {
	      response.setLocale(request.cookies.translation);
          response.render("CaltranoSunioCostola",{translation:response});
    });
	//Pagina per il percorso Novegno Priaforà
    app.get("/NovegnoPriafora", function(request, response)
	   {
	      response.setLocale(request.cookies.translation);
          response.render("NovegnoPriafora",{translation:response});
    });
	//Fa comparire una schermata dove è possibile farsi una selfie
    app.get("/takePicture", function(request, response)
	   {
	      response.setLocale(request.cookies.translation);
          response.render("takePicture",{translation:response});
    });
    //Pagina cambio Lingua Italiana
    app.get("/it", function(request, response)
	   {
	      translation.setLocale('it');
	      response.cookie('translation','it');
          response.redirect('/');
    });
    //Pagina cambio Lingua Inglese
    app.get("/en", function(request, response)
	   {
	      translation.setLocale('en');
	      response.cookie('translation','en');
          response.redirect('/');
    });
    //Pagina inserimento e visualizzazioni commenti di una mappa scelta
    app.get("/mapManage", function(request, response)
	   {
	      response.setLocale(request.cookies.translation);
          response.render('mapManage',{translation:response,mapTitle:request.query.mapTitle,title:request.query.maptitle});
    });
    //Riceve una richiesta per le coordinate
    app.post('/getGeoPoints', function(request, response)
	   {
	      var dataReq=request.body;
	      MyMongo.QueryData(dataReq , response);
    });
    //Visualizza una traccia sulla Mappa	
    app.post('/getGeoTrace', function(request, response)
	   {
	      var dataReq=request.body;
	      MyMongo.QueryArrayData(dataReq , response);
    }); 
	//Visualizza la mappa con la posizione attuale e il tracciato della mappa scelta
    app.post('/getTracePosition', function(request, response)
	   {
	      var dataReq=request.body;
	      MyMongo.QueryArrayDataPosition(dataReq , response);
    }); 
    //Calcola la distanza delle tracce dalla posizione attuale	
    app.post('/getGeoDistanceTrace', function(request, response)
	   {
	      var dataReq=request.body;
	      MyMongo.QueryNearMaps(dataReq , response);
    }); 
	//Vede in archivio se all'utente è associata una foto
	app.post('/getUserPicture',function(request,response)
	   {
	      var dataReq=request.body;
	      MyMongo.getUserPicture(dataReq , response);
    }); 
	//Salva nella cartella Upload un file 
	app.post('/fileUpload',function(request,response)
	   {
		  //console.dir(request);
		  var path=process.cwd() +'/public/upload'; 
		  var filename = 'foo'+crypto.randomBytes(4).readUInt32LE(0)+'bar';
		  var data=request;
		  path=path+'/'+filename+'.png';
		  //Salva il file
		  fs.writeFile(path,data,'binary',function(err)
		  {
			    if(err)
			    {
				   console.log("fileUpload error = "+err);
			    }   	  
			    else
			    {
				   console.log("fileUpload saved to "+path);
			    }
		   });				
       });
    //Pagina messaggio di Errore   
    app.use(function(request, response)
	   {
	      response.setLocale(request.cookies.translation);
	      response.status(404).render("404",{translation:response});
    });
    app.use(function(req, res, next) 
	   {
          if (req.secure) 
		  {
             next();
          } 
		  else 
		  {
             res.redirect('https://' + req.headers.host + req.url);
          }
    });
}
//**********************************************************************************************************************
webServer.prototype.open = function (port, ip_address, force_https)  
{
	var privKey=path.join(process.cwd() +"/public/certificati/privkey.pem");
	var pubCert=path.join(process.cwd() +"/public/certificati/pubcert.pem");
	//if ((force_https == undefined || force_https == false) && (port > 8000 || port == 80)) {
	if (force_https == undefined || force_https == false) 
	{
        // === HTTP  ===
		if (ip_address != undefined) {
			app.listen(port, ip_address, function () {
				console.log('Webserver HTTP started on port ' + port + ' and IP : ' + ip_address);
			});
		}
		else
		{
			app.listen(port, function () {
				console.log('Webserver HTTP started on port ' + port);
			});
		}
    }
    else 
	{
        // === HTTPS ===
        console.log("Path Certificati PEM : "+privKey);
        console.log("Path Certificati CERT: "+pubCert);
        var hskey = fs.readFileSync(privKey);
        var hscert = fs.readFileSync(pubCert);
        var options = {
            key: hskey,
            cert: hscert
        };
		// === HTTPS ===
		if (ip_address != undefined) {
			var secureServer = https.createServer(options, app).listen(port, ip_address, function () {
				console.log('Webserver [HTTPS] started on port ' + port + ' and IP : ' + ip_address);
			});
		} else {
			var secureServer = https.createServer(options, app).listen(port, function () {
				console.log('Webserver [HTTPS] started on port ' + port);
			});		
		}
    }
}
//**********************************************************************************************************************
/*
   Verifica che l'utente sia autenticato
*/
function ensureAuthenticated(request, response, next) 
{
   if (request.isAuthenticated()) 
   {
      next();
   } 
   else 
   {
      request.flash("info", "You must be logged in to see this page.");
      response.redirect("/login");
   }
}

module.exports = webServer;
