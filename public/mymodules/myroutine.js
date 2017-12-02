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
//Per poter gestire le traduzioni
var translation=require("i18n");
//*******************************************************************************************************************
/*
   Fa una chiamata ajax per richiedere le coordinate
*/   
function ajaxCall(data)
{
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() 
   {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) 
	  {
         var uluru = JSON.parse(this.responseText);
         if(data.AJaxCallBack == '/getGeoPoints')		 
		 {
		    showMap(uluru);  
		 }
         else if(data.AJaxCallBack == '/getGeoTrace')		 
		 {
		    showMapTrace(uluru);  
		 }
       }
   };
   xhttp.open("POST",data.AJaxCallBack);
   xhttp.setRequestHeader("Content-Type", "application/json");   
   xhttp.send(JSON.stringify(data));   
}
//*******************************************************************************************************************
/*
   Visualizza la mappa indicando in uluru le coordinate della mappa da visualizzare
*/
function showMap(uluru)
{
	try{
		//Carica la mappa. La variabile datacontiene le coordinate della mappa da visualizzare
        var myOptions = {center: new google.maps.LatLng(uluru.mapValue),zoom: 12,mapTypeId: google.maps.MapTypeId.ROADMAP};
        var map = new google.maps.Map(document.getElementById(uluru.id),myOptions);
		//Vede se inserisce un marker
		if(uluru.showMarker == 'SI')
	    {
           var marker = new google.maps.Marker({position: uluru.mapValue,map: map});
		}		
	}
	catch(err)
	{
	     alert(err);
	}
}

//*******************************************************************************************************************
/*
   Visualizza la mappa indicando in uluru le coordinate della mappa da visualizzare e il tracciato del percorso
*/
function showMapTrace(uluru)
{
	try{
		//Carica la mappa. La variabile data contiene le coordinate del punto
        var myOptions = {center: new google.maps.LatLng(uluru.mapValue),zoom: 12,mapTypeId: google.maps.MapTypeId.ROADMAP};
        var map = new google.maps.Map(document.getElementById(uluru.id),myOptions);
		//Vede se inserisce un marker
		if(uluru.showMarker == 'SI')
	    {
           var marker = new google.maps.Marker({position: uluru.mapValue,map: map});
		}
		//Effettua il disegno dei Waypoints
        var flightPath = new google.maps.Polyline({
           path: uluru.Waypoints,
           geodesic: true,
           strokeColor: '#FF0000',
           strokeOpacity: 1.0,
           strokeWeight: 2
        });
        flightPath.setMap(map);
	}
	catch(err)
	{
	     alert(err);
	}
}

//*******************************************************************************************************************
/*
   Interroga la posiione attuale del dispositivo
*/
function getLocation()
{
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(showPosition);
	}
	else
	{
		var x=document.getElementById("mialatitudine");
		//ERRORE-04 = GeoLocation non supportata!
		x.innerHtmp=translation.__("ERRORE-04" );
	}
}
//*******************************************************************************************************************
function showPosition(position)
{
	var txtCoord=parseFloat(position.coords.latitude).toFixed(2)+"° ";
	if(position.coords.latitude >= 0)
	{
       txtCoord=txtCoord+"Nord <br>";		    
	}
	else
	{
        txtCoord=txtCoord+"Sud <br>";		    
	}
	document.getElementById("mialatitudine").innerHTML=txtCoord;
	txtCoord=parseFloat(position.coords.longitude).toFixed(2)+"° ";
	if(position.coords.longitude >= 0)
	{
        txtCoord=txtCoord+"Est <br>";		    
	}
	else
	{
        txtCoord=txtCoord+"Ovest <br>";		    
	}
	document.getElementById("mialongitudine").innerHTML=txtCoord;
}
	  



