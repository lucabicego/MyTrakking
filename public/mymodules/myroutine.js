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
         else if(data.AJaxCallBack == '/getGeoDistanceTrace')		 
		 {
		    showTabellaPercorsi(uluru);  
		 }
         else if(data.AJaxCallBack == '/getUserPicture')		 
		 {
		    showUserPicture(uluru);  
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
	     alert("showMap: "+err);
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
	     alert("showMapTrace:"+err);
	}
}

//*********************************************************************
/*
   Mostra i dati nella tabella con i nome dei percorsi e la distanza in Km
   dalla posizione attuale
*/
function showTabellaPercorsi(uluru)
{  
   try{
	  var i=0; 
      var htmlStr="";
	  for(i=0;i<uluru.length;i++)
	  {
         htmlStr+="<tr scope='row'>";
         htmlStr+="<td>"+uluru[i].maptitle+"</td>";
		 //Visualizzo la distanza in km
         htmlStr+="<td>"+(uluru[i].distance/1000).toFixed(2)+"</td>";
		 htmlStr+="</tr>";
	  }
	  document.getElementById(uluru[0].id).innerHTML=htmlStr;
	}
	catch(err)
	{
	   alert("showTabellaPercorsi: "+err);
	}
	return;
}
//*********************************************************************
/*
   Visualizza l'immagine il cui url è ottenuto dal server
*/
function showUserPicture(uluru)
{  
   try{
	  document.getElementById(uluru.id).src=uluru.urlImg;
	}
	catch(err)
	{
	   alert("showUserPicture: "+err);
	}
	return;
}

//*********************************************************************
/*
   Gestisce la fotocamera per acquisire una immagine
*/
function getPicture() 
{
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = 320;    // We will scale the photo width to this
  var height = 0;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;

  function startup() 
  {
    video = document.getElementById('picturevideo');
    canvas = document.getElementById('picturecanvas');
    photo = document.getElementById('picturephoto');
    startbutton = document.getElementById('takepicture');
    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);
    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } 
		else 
		{
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );

    video.addEventListener('canplay', function(ev){
      if (!streaming) 
	  {
        height = video.videoHeight / (video.videoWidth/width);
      
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.
      
        if (isNaN(height)) 
		{
          height = width / (4/3);
        }
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);
    startbutton.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
    }, false);
    clearphoto();
  }
  // Fill the photo with an indication that none has been
  // captured.
  function clearphoto() 
  {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }
  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.
  function takepicture() 
  {
    var context = canvas.getContext('2d');
    if (width && height) 
	{
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    } 
	else 
	{
      clearphoto();
    }
  }
  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
}	






