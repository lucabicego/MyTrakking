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
var url = process.env.MONGOLAB_URI; 
var Schema = mongoose.Schema;
//Definisce uno schema per leggerele polyline
var polylineSchema = new Schema({
  title: String,
  maptitle: String,
  position: {
    latitude: Number,
    longitude: Number
  },
  created: Date,
  updated: Date
});
var MapPolylines = mongoose.model('mytrakking', polylineSchema);
module.exports = MapPolylines;
