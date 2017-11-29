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
//Funzioniche vengono esportate
module.exports = function() 
{
   passport.serializeUser(function(user, done) 
   {
     done(null, user._id);
   });
   passport.deserializeUser(function(id, done) 
   {
      MyMongo.User.findById(id, function(err, user) 
	  {
         done(err, user);
      });
   });
};
