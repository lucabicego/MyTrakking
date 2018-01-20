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
var async=require('async');
var bcrypt = require("bcrypt-nodejs");
//Questa è una variabile utilizzzata per generare il SALT della funzione di HASH
var SALT_FACTOR = 10; 
var mongoose = require('mongoose');
//Estrapola l'url di connessione al db MONGO
var urlMongoDb = process.env.MONGOLAB_URI;
var mapDistance;
var fromCord;
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
	  imageurl: { type: String, required:true},
      createdAt: { type: Date, default: Date.now },
      displayName: String,
      bio: String
    });
//***************************************************************************************************************
//Qui aggiungiamo metodi per lo schema utente
userSchema.methods.name = function() {
   return this.displayName || this.username;
};
//***************************************************************************************************************
userSchema.methods.imageUrl = function() {
   return this.imageurl;
};
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
		//Salva la password con il suo valore di hash
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
/*
   Restituisce il percorso dell'immagine della foto dell'utente
*/
var getUserPicture=function(dataReq , res)
{
   var username = dataReq.username;
   var data={'username':username,'id':dataReq.id,'urlImg':'/images/UserPlaceholder.png'};
   User.findOne({username: username}).exec(function(err, user) 
   {
         if (err) 
	     { 
	        //Utente nuovo
			console.log("getUserPicture user.imageurl = "+data.urlImg);
            res.header('Content-type','application/json');
	        res.header('Charset','utf8');
	        res.send(JSON.stringify(data));
	     }
	     //Ritorna dall'interrogazione un utente 
         if (user) 
	     {
			//Utente esiste gia'  
			if(user.imageurl.length > 0)
			{
               data.urlImg=user.imageurl; 
			}
			console.log("getUserPicture user.imageurl = "+urlImg.urlImg);
            res.header('Content-type','application/json');
	        res.header('Charset','utf8');
	        res.send(JSON.stringify(data));
         }
		 else
		 {
	        //Utente nuovo
			console.log("getUserPicture data.urlImg = "+data.urlImg);
            res.header('Content-type','application/json');
	        res.header('Charset','utf8');
	        res.send(JSON.stringify(data));
		 }
   });
}
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
//***************************************************************************************************************
/*
   Restituisce un elenco dei nomi delle mappe con la distanza in km
   Operazioni:
   1. Interroga il db con aggregate per avere i nomi delle mappe
   2. Per ogni nome della mappa (field = maptitle) calcola la distanza
   3. inserisce i dati in una collezione da restituire
   
   Parametri di ingresso:
   dataReq contiene la posizione attuale. Il formato dei dati contenuti è il seguente
   {
	'mapValue':{'lat': latitude,'lng':longitude},
	'id':'MiaPosizioneMap',
	'showMarker':'SI'
   };
*/
var QueryNearMaps=function(dataReq,res)
{
	try{
	   mapDistance= new Array();
	   //Imposta l'id del documento HTML
       fromCord = new LatLon(dataReq.mapValue.lat,dataReq.mapValue.lng);
	   QueryMapsName(res,dataReq.id);
	}
   catch(err)
   {
       console.log("QueryNearMaps::error"+err);
   }
}
//***************************************************************************************************************
/*
   Estrapola dalla collezione MyTrakking
   N.B.Nell'aggregate avevo omesso le parentesi [...]   
*/
var QueryMapsName=function(res,id)
{
   try{
      MapPolylines.aggregate([{"$group":{_id:"$maptitle"}}],function(err,MapDatas)
      {
	     //Esecuzione della funzione in modo syncrono 
	     async.each(MapDatas,function(MapData,callback)
	     {
			//Per ogni dato letto va ad aggiungersi il titolo in mapTitle 
		    mapDistance.push({'maptitle':MapData._id,'id':id,'distance':0,'done':false});
			//Chiama la funzione di callback function(err). Se si verifica un errore valorizzare err 
			//come ad esempio callback("Msg di errore")
			callback();
	     },
         function(err)
         {
			//Questa funzione è eseguita quanto tutto è finito 
	        if(err)
	        {
                console.log("QueryNearMaps::MapPolylines.aggregate :error = "+err);
	        }
	        else
	        {
	            //console.log("mapDistance.length = "+mapDistance.length);
	            //console.log("Execute QueryDistance(...)");
				QueryDistance(res);
	        }
         });
	  });
   }
   catch(err)
   {
       console.log("QueryMapsName::error = "+err);
   }
   return;
}
//***************************************************************************************************************
/*
   Estrapola le coordinate in base al valore del campo maptitle
   Per ogni coordinata calcola la distanza dalla posizione attuale
*/
var QueryDistance=function(res)
{
   try{
      var num=0,i=0;
      var distance=0,distanceR=0;
	  //console.log("QueryDistance::mapDistance.length = "+mapDistance.length);
	  for(num=0;num < mapDistance.length;num++)
	  {
	     MapPolylines.find({'maptitle': mapDistance[num].maptitle}, {_id: 0},function(err,MapDatas)
	     {
	        //Esecuzione della funzione in modo syncrono 
	        async.each(MapDatas,function(MapData,callback)
	        {
			   //Chiama la funzione di callback se si verifica un errore
			   var toCord = new LatLon(MapData.position.latitude,MapData.position.longitude);				 
			   //console.log("MapData.position ["+MapData.position.latitude+","+MapData.position.longitude+"]");
			   for(i=0;i<mapDistance.length;i++)
			   {
                  if(MapData.maptitle == mapDistance[i].maptitle)
				  {
			         distance=mapDistance[i].distance;		  
			         distanceR=fromCord.distanceTo(toCord);
			         if(distance == 0 || distance > distanceR)
			         {
			           mapDistance[i].distance=distanceR;
				       mapDistance[i].done=true;
					 }
				  }
			   }
			   callback();
	        },
            function(err)
            {
	           if(err)
	           {
                  console.log("QueryDistance::error = "+err);
	           }
	           else
	           {
				  var procedi=true;
				  var l=0;
				  //console.log("mapDistance.length ="+mapDistance.length);
			      for(l=0;l<mapDistance.length;l++)
			      {
                     if(mapDistance[l].done == false)
				     {
						 //console.log("mapDistance["+l+"].done = false");
						 procedi=false;
					 }
				  }
				  if(procedi == true)
				  {
			         for(l=0;l<mapDistance.length;l++)
			         {
                        console.log("QueryDistance -> {"+mapDistance[l].id+","+mapDistance[l].maptitle+","+mapDistance[l].distance+","+mapDistance[l].done+"}");
					 }
                     res.header('Content-type','application/json');
	                 res.header('Charset','utf8');
	                 res.send(JSON.stringify(mapDistance));
				  }
	           }
            });
	     });
	  }
   }
   catch(err)
   {
       console.log("QueryDistance::error = "+err);
   }
   return;
}
//***************************************************************************************************************
/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon) 
{
	try{
       // allow instantiation without 'new'
       if (!(this instanceof LatLon))
       {
		  return new LatLon(lat, lon);
	   }		   
       this.lat = Number(lat);
       this.lon = Number(lon);
	}
	catch(err)
	{
	   console.log("LatLon::err = "+err);
		
	}
    return;
}
//***************************************************************************************************************
/**
 * Returns the distance from ‘this’ point to destination point (using haversine formula).
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance between this point and destination point, in same units as radius.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var d = p1.distanceTo(p2); // 404.3 km
 */
LatLon.prototype.distanceTo = function(point, radius) 
{
	try{
       if (!(point instanceof LatLon)) 
		   throw new TypeError('point is not LatLon object');
       radius = (radius === undefined) ? 6371e3 : Number(radius);

       // a = sin²(Δφ/2) + cos(φ1)⋅cos(φ2)⋅sin²(Δλ/2)
       // tanδ = √(a) / √(1−a)
       // see mathforum.org/library/drmath/view/51879.html for derivation

       var R = radius;
       var phi1 = this.lat.toRadians(),  lambda1 = this.lon.toRadians();
       var phi2 = point.lat.toRadians(), lambda2 = point.lon.toRadians();
       var DeltaPhi = phi2 - phi1;
       var DeltaLambda = lambda2 - lambda1;
       var a = Math.sin(DeltaPhi/2) * Math.sin(DeltaPhi/2)
          + Math.cos(phi1) * Math.cos(phi2)
          * Math.sin(DeltaLambda/2) * Math.sin(DeltaLambda/2);
       var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
       var d = R * c;
	}
	catch(err)
	{
	     console.log("LatLon.prototype.distanceTo::err = "+err);
		
	}
    return d;
};
//***************************************************************************************************************
/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) 
{
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}
//***************************************************************************************************************
/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) 
{
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

//***************************************************************************************************************
//Funzioni che vengono esportata ai restanti moduli
module.exports = 
{
QueryData,
getUserPicture,
QueryArrayData,
QueryNearMaps,
User
};
