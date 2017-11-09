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
var loadMap = function() 
{
	try{
		//Carica lamappa che mostra il punto dove partire
		//Coordinate del punto
		//alert(urlMongo);
		var uluru = {lat: 45.7755, lng: 11.45};
        var myOptions = {center: new google.maps.LatLng(uluru),zoom: 12,mapTypeId: google.maps.MapTypeId.ROADMAP};
        var map = new google.maps.Map(document.getElementById("ComeArrivareCimitero"),myOptions);
		//Inserisce un marcker
        var marker = new google.maps.Marker({position: uluru,map: map});
		//Carica la mappa del Tracciato Caltrano Sunio
		uluru = {lat: 45.8005, lng: 11.4494};
        myOptions = {center: new google.maps.LatLng(uluru),zoom: 14,mapTypeId: google.maps.MapTypeId.ROADMAP};
        map = new google.maps.Map(document.getElementById("TracciatoCaltranoSunio"),myOptions);
	}
	catch(err)
	{
	     alert(err);
	}
};
