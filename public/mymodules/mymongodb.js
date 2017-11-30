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
var bcrypt = require("bcrypt-nodejs");
//Questa è una variabile utilizzzata per generare il SALT della funzione di HASH
var SALT_FACTOR = 10; 
var mongoose = require('mongoose');
//Estrapola l'url di connessione al db MONGO
var urlMongoDb = process.env.MONGOLAB_URI;
console.log("urlMongoDB : "+urlMongoDb); 
//Esegue la connessione al db MONGO
mongoose.connect(urlMongoDb,function(err, db) 
{
   if (err) throw err;
   console.log("Database opened!");
});  
var Schema = mongoose.Schema;

//***************************************************************************************************************
//Definisce uno schema per leggerele polyline
var polylineSchema = new Schema({
  _id: String,	
  title: String,
  maptitle: String,
  position: {
    latitude: Number,
    longitude: Number
  },
  created: Date,
  updated: Date
},{ collection : 'mytrakking' });
//***************************************************************************************************************
var MapPolylines = mongoose.model('mytrakking', polylineSchema);
//***************************************************************************************************************
//Definizione di uno Schema per l'utente
var userSchema = mongoose.Schema(
   {
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      displayName: String,
      bio: String
    });
//***************************************************************************************************************
//Qui aggiungiamo metodi per lo schema utente
userSchema.methods.name = function() {
   return this.displayName || this.username;
};
//Questa è una funzione dummy 
var noop = function() {};
//***************************************************************************************************************
//Questa funzione effettua il salvataggio dell'hash della password
userSchema.pre("save", function(done) {
   var user = this;
   if (!user.isModified("password")) 
   {
      return done();
   }
   bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
     if (err) 
	 { 
        return done(err); 
	 }
     bcrypt.hash(user.password, salt, noop,function(err, hashedPassword) 
	 {
        if (err) 
		{ 
	       return done(err); 
		}
		//Salva la password conil suo valore di hash
        user.password = hashedPassword;
        done();
     });
   });
});
//***************************************************************************************************************
//Vede se la password inserita dall'utente corrisponde a quella presente nel db
userSchema.methods.checkPassword = function(guess, done) {
   bcrypt.compare(guess, this.password, function(err, isMatch) {
      done(err, isMatch);
   });
};	
//Associamo lo schema User al db mytrakking
var User = mongoose.model("User", userSchema);
//***************************************************************************************************************
//Questa funzione è utilizzata per effettuare l'interrogazione dei dati   
var QueryData=function(dataReq,res)
{
   MapPolylines.findOne({'title': dataReq.mapValue.title,'maptitle':dataReq.mapValue.maptitle}, {_id: 0 }).exec(function(err, MapData) 
   {
      if(err) 
	  { 
           console.log("MapPoly.findOne :error");
	  }
	  else
	  {
	      //Invia le coordinate del punto di Partenza	
	      var data = {'mapValue':{'lat': MapData.position.latitude,'lng':MapData.position.longitude}};
	      data.id=dataReq.id;
	      data.showMarker=dataReq.showMarker;
          res.header('Content-type','application/json');
	      res.header('Charset','utf8');
	      res.send(JSON.stringify(data));
	  }		  
   });
	
}
//***************************************************************************************************************
//Estrapola un array di documenti che contengono i Waypoints da visualizzare nella mappa
var QueryArrayData=function(dataReq,res)
{
   MapPolylines.find({'title': dataReq.mapValue.title,'maptitle':dataReq.mapValue.maptitle}, {_id: 0 }).exec(function(err, MapData)
   {
      if(err) 
	  { 
           console.log("MapPoly.find :error");
	  }
	  else
	  {
		  var i=0;
	      //Invia le coordinate del punto di Partenza	
	      var data = {'mapValue':{'lat': MapData[0].position.latitude,'lng':MapData[0].position.longitude},'id':dataReq.id};
	      data.showMarker=dataReq.showMarker;
		  //Crea un array
		  data.Waypoints=new Array();
		  console.log("Ricevuti "+MapData.length+" documenti per i WayPoints");
		  //Vengono aggiunti i Waypoints letti dal db all'array.
		  for(i=0;i<MapData.length;i++)
		  {
		      data.Waypoints.push({'lat':MapData[i].position.latitude,'lng':MapData[i].position.longitude});
			  //console.log("data.Waypoints["+i+"]{"+data.Waypoints[i].lat+","+data.Waypoints[i].lng+"}");
		  }
          res.header('Content-type','application/json');
	      res.header('Charset','utf8');
	      res.send(JSON.stringify(data));
	  }		  
   });
}
//Funzioni che vengono esportata ai restanti moduli
module.exports = 
{
QueryData,
QueryArrayData,
User
};
