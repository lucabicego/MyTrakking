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
var MapPolylines = mongoose.model('mytrakking', polylineSchema); 
//Questa funzione è utilizzata per effettuare l'interrogazione dei dati   
var QueryData=function(dataReq,res)
{
   MapPolylines.findOne({'title': dataReq.mapValue.title,'maptitle':dataReq.mapValue.maptitle}, {_id: 0 }).exec(function(err, MapData) 
   {
      if(err) 
	  { 
           console.log("MapPoly :error");
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
module.exports = QueryData;
