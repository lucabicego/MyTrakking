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
var passport = require("passport");
var MyMongo=require('./mymongodb.js');
var LocalStrategy = require("passport-local").Strategy;
//**************************************************************************************
//Viene effetuato il controllo che l'utente esista e che la sua password sia valida
//Viene cercato nel db se esiste l'utente quindi viene eseguita la checkPassowrd
//definita in mymongodb. Questa è utilizzata per confrontare la password 
//contenuta nel db con quella scritta dall'utente
passport.use("login", new LocalStrategy(function(username, password, done) 
   {
      MyMongo.User.findOne({ username: username }, function(err, user) 
	  {
         if (err) 
		 { 
	        return done(err); 
		 }
         if (!user) 
		 {
           return done(null, false,{ message: "No user has that username!" });
         }
		 //Definita in mymondodb.js
         user.checkPassword(password, function(err, isMatch) 
		 {
            if (err) 
			{ 
		       return done(err); 
			}
            if (isMatch) 
			{
               return done(null, user);
            } 
			else 
			{
               return done(null, false,{ message: "Invalid password." });
            }
         });
      });
    }
));
//**************************************************************************************
//Funzioni che vengono esportate
module.exports = function() 
{
   passport.serializeUser(function(user, done) 
   {
     console.log("passport.serializeUser()");
     done(null, user._id);
   });
   passport.deserializeUser(function(id, done) 
   {
     console.log("passport.deserializeUser()");
      MyMongo.User.findById(id, function(err, user) 
	  {
         done(err, user);
      });
   });
};
