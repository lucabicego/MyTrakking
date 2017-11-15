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

//*******************************************************************************************************************
function ajaxCall(data)
{
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() 
   {
      if (this.readyState == 4 && this.status == 200) 
	  {
         var uluru = JSON.parse(this.responseText);		 
		 showMap(uluru);  
       }
   };
   xhttp.open("POST", "/getGeoPoints");
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
		//Fa una chiamata ajax per richiedere le coordinate
		//Carica la mappa che mostra il punto dove partire
		//Coordinate del punto
        var myOptions = {center: new google.maps.LatLng(uluru.mapValue),zoom: 12,mapTypeId: google.maps.MapTypeId.ROADMAP};
        var map = new google.maps.Map(document.getElementById(uluru.id),myOptions);
		//Inserisce un marcker
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



