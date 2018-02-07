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
   try{	
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
			   //Mostra sulla mappa la traccia	
		       showMapTrace(uluru);  
		    }
            else if(data.AJaxCallBack == '/getTracePosition')		 
		    {
			   //Mostra sulla Mappa la Traccia e la posizione	
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
            else if(data.AJaxCallBack == '/getComments')		 
		    {
			   //Mostra la tabella commenti	
		       showTabellaCommenti(uluru);
		    }
            else if(data.AJaxCallBack == '/getCommentiTracciaMarkers')		 
		    {
			   //Mostra la tabella commenti	
		       showTabellaCommenti(uluru);
			   //Mostra nella mappa i markers dove sono stati inseriti i commenti
               showMapTraceMarkerCommenti(uluru);			   
		    }
			else if(data.AJaxCallBack == '/saveComment')
			{
		       //Richiede di disegnare la traccia i percorsi e i markers		
		       getComments(uluru);  
			}	
			else
			{
			   alert("ajaxCall --> "+data.AJaxCallBack+" non gestito !");	 
			}	
         }
      };
      xhttp.open("POST",data.AJaxCallBack);
      xhttp.setRequestHeader("Content-Type", "application/json");   
      xhttp.send(JSON.stringify(data));   
	}
	catch(err)
	{
	     alert("ajaxCall: "+err);
	}
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
   uluru contiene i seguenti valori
   
   	uluru.mapValue.lat			= latitudine per il punto centrale della mappa
	uluru.mapValue.lng			= longitudine per il punto centrale della mappa
	uluru.id					= id oggetto DOM dove visualizzare la mappa
	uluru.showMarker			= vale SI/No per visualizzare il marker
	uluru.Maypoints[1..n].lat	= latitudine dei punti che mostrano il percorso
	uluru.Maypoints[1..n].lng	= longitudine dei punti che mostrano il percorso
*/
function showMapTrace(uluru)
{
	try{
		//Carica la mappa. La variabile data contiene le coordinate del punto
        var myOptions = {center: new google.maps.LatLng(uluru.mapValue),zoom: 12,mapTypeId: google.maps.MapTypeId.ROADMAP};
         window.map = new google.maps.Map(document.getElementById(uluru.id),myOptions);
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
   Visualizza nella mappa 
*/
function showMapTraceMarker(uluru)
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
   
   Valori contenuti in uluru
   
   uluru[l].id 			= id della table dove visualizzare le distanze
   uluru[l].maptitle	= titolo della mappa
   uluru[l].title		= titolo del campo
   uluru[l].distance	= distanza minima tra la posizione attuale e quella del tracciato
   uluru[l].done		= falg booleano che vale true se il dato è stato estratto

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
		 //Visualizzo un pulsante per accedere alla finestra della mappa
         htmlStr+="<td><button type='button' class='btn btn-primary' onclick=window.open('/mapManage?mapTitle="+uluru[i].maptitle+"&title="+uluru[i].title+"','_self')>Go</button></td>";
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
   Richiede l'elenco dei commenti e dei tratticati dela mappa
   
   Valori contenuti in uluru
   
   uluru.title			= titolo
   uluru.maptitle		= titolo della mappa
   uluru.lat			= latitudine
   uluru.lng			= longitudine
   uluru.id_tab			= id dell'oggetto DOM dove visualizzare i dati della tabella
   uluru.id_map			= id dell'oggetto DOM dove visualizzare i markersk sulla mappa
   uluru.showMarker		= Vale si per mostrare i Markers
*/
function getComments(uluru)
{
   try{
      var data={'lat': uluru.lat,'lng':uluru.lng,'title':uluru.title,'maptitle':uluru.maptitle,'id_map':uluru.id_map,'id_tab':uluru.id_tab,'showMarker':uluru.showMarker,'AJaxCallBack':'/getCommentiTracciaMarkers'};
	  ajaxCall(data);
	}
	catch(err)
	{
	   alert("getComments: "+err);
	}
	return;
	
}
//*********************************************************************
/*
   VIsualizza una tabella che contiene i commenti
   Valori contenuti in uluru

   uluru.maptitle				= titolo della mappa
   uluru.id_tab					= id dell'oggetto DOM che visualizza la tabella dei commenti
   uluru.id_map					= id dell'oggetto DOM che visualizza la mappa
   uluru.Comments[i].user		= utente che ha inserito il commento
   uluru.Comments[i].id_comment	= id del commento inserito dall'utente
   uluru.Comments[i].comment	= commento inserito dall'utente
   uluru.Comments[i].data 		= data di inserimento del commento
   uluru.Comments[i].lat		= latitidine dove è stato inserito il commento
   uluru.Comments[i].lng		= longitudine dove è stato inserito il commento   

*/
function showTabellaCommenti(uluru)
{  
   try{
	  var i=0; 
      var htmlStr="";
	  //Ricava l'utente
	  var user=document.getElementById("currentUser").innerHTML;
	  if(uluru.Comments == undefined)
	  {
		  return;
	  }	  
	  for(i=0;i<uluru.Comments.length;i++)
	  {
		  
	     var txtCoord=parseFloat(uluru.Comments[i].lat).toFixed(2)+"° / ";
		 txtCoord=txtCoord+parseFloat(uluru.Comments[i].lng).toFixed(2)+"°";
         htmlStr+="<tr scope='row'>";
         htmlStr+="<td>"+uluru.Comments[i].comment+"</td>";
         htmlStr+="<td>"+txtCoord+"</td>";
		 var dataTmp = new Date(uluru.Comments[i].data);
         htmlStr+="<td>"+prefixZeros(dataTmp.getDate(),2)+"/"+prefixZeros(dataTmp.getMonth()+1,2)+"/"+dataTmp.getFullYear()+" "+dataTmp.getHours()+":"+dataTmp.getMinutes()+":"+dataTmp.getSeconds()+"</td>";
         htmlStr+="<td>"+uluru.Comments[i].user+"</td>";
		 if(user == uluru.Comments[i].user)
		 {
            htmlStr+="<td><button type='button' class='btn btn-warning' onclick='clickEdit_";
			htmlStr+=uluru.id_tab;
			htmlStr+="(\"";
			htmlStr+=uluru.Comments[i].id_comment;
			htmlStr+="\")'>Edit</button></td>";
            htmlStr+="<td><button type='button' class='btn btn-danger' onclick='clickDelete_";
			htmlStr+=uluru.id_tab;
			htmlStr+="(\"";
			htmlStr+=uluru.Comments[i].id_comment;
			htmlStr+="\")'>Delete</button></td>";
		 }	
		 htmlStr+="</tr>";
	  }
	  document.getElementById(uluru.id_tab).innerHTML=htmlStr;
	}
	catch(err)
	{
	   alert("showTabellaCommenti: "+err);
	}
	return;
}

//*********************************************************************
/*
   VIsualizza nella mappa  i markers dove sono stati posizionati i commenti
   Valori contenuti in uluru

   uluru.maptitle				= titolo della mappa
   uluru.lat					= latitudine della posizione Attuale
   uluru.lng					= longitudine della posizione Attuale
   uluru.id_tab					= id dell'oggetto DOM che visualizza la tabella dei commenti
   uluru.id_map					= id dell'oggetto DOM che visualizza la mappa
   uluru.showMarker				= se vale si Mostra il marker della posizione di partenza
   uluru.Maypoints[1..n].lat	= latitudine dei punti che mostrano il percorso
   uluru.Maypoints[1..n].lng	= longitudine dei punti che mostrano il percorso
   uluru.Comments[i].user		= utente che ha inserito il commento
   uluru.Comments[i].id_comment	= id del commento inserito dall'utente
   uluru.Comments[i].comment	= commento inserito dall'utente
   uluru.Comments[i].data 		= data di inserimento del commento
   uluru.Comments[i].lat		= latitidine dove è stato inserito il commento
   uluru.Comments[i].lng		= longitudine dove è stato inserito il commento   

*/
function showMapTraceMarkerCommenti(uluru)		   
{
   try{
	  var i=0; 
	  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var myOptions = {center: new google.maps.LatLng(uluru.lat,uluru.lng),zoom: 12,mapTypeId: google.maps.MapTypeId.ROADMAP};
	  var map = new google.maps.Map(document.getElementById(uluru.id_map),myOptions);
	  //Effettua il disegno dei Waypoints
      var flightPath = new google.maps.Polyline({
           path: uluru.Waypoints,
           geodesic: true,
           strokeColor: '#FF0000',//Colore Rosso della traccia
           strokeOpacity: 1.0,
           strokeWeight: 2
      });
      flightPath.setMap(map);
	  var marker;
	  if(uluru.showMarker == 'SI')
	  {	  
	     //Visualizza il marker della posizione attuale
         marker = new google.maps.Marker({
            position: new google.maps.LatLng(uluru.lat, uluru.lng),
            icon: {
               path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
               strokeColor: "blue",
               scale: 3
            },			
            map: map,
			title:"Mia Posizione Attuale",
			visible:true
         });		 
	  }
	  if(uluru.Comments == undefined)
	  {	  
          return;
      }
	  if(uluru.Comments.length == 0)
	  {
		  return;
	  }
	  //Visualizza i markers assegnandogli una label   
	  var infowindow = new google.maps.InfoWindow;
	  for(i=0;i<uluru.Comments.length;i++)
	  {
		    var str=uluru.Comments[i].user+": "+uluru.Comments[i].comment;   
	        marker = new google.maps.Marker({
               position: new google.maps.LatLng(uluru.Comments[i].lat, uluru.Comments[i].lng),
               map: map,
			   label:labels[i% labels.length],
			   title:str,
			   visible:true
            });
			//Aggiunge l'evento OnClick
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
               return function() 
			   {
                  infowindow.setContent(marker.getTitle());
                  infowindow.open(map, marker);
               }
			})(marker, i));
      }
	}
	catch(err)
	{
	   alert("showMarkerCommenti: "+err);
	}
	return;
}

//*********************************************************************
/*
  Questa routine è utilizzata per avere il valore contenuto nella query string
*/
function getParameterByName(name, url) 
{
  if (!url) 
	 url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
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
  var savephoto = null;

  function startup() 
  {
    video = document.getElementById('picturevideo');
    canvas = document.getElementById('picturecanvas');
    photo = document.getElementById('picturephoto');
    startbutton = document.getElementById('takepicture');
	savephoto = document.getElementById('savepicture');
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
	savephoto.addEventListener('click',function(ev){
		savepicture();
		ev.preventDefault();
	},false);
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
	blob=null;
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
  //Carica nel canvas la foto selezionata ela invia con una chiamata Ajax
  function savepicture()
  {
    var context = canvas.getContext('2d');
    if (width && height) 
	{
      canvas.width = photo.width;
      canvas.height = photo.height;
      context.drawImage(photo, 0, 0, photo.width, photo.height);
      canvas.toBlob(function(blob) {
         var xhttp = new XMLHttpRequest();
         xhttp.onreadystatechange = function() 
         {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) 
	        {
		    }		
         }
         xhttp.open('POST','/fileUpload');
         xhttp.setRequestHeader("Content-Type", "image/jpeg");   
         //xhttp.setRequestHeader("Content-Type", "multipart/form-data");   
         xhttp.send(blob);
      });
	}
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
}	

//*********************************************************************
/*
   Funzione per anteporre degli zeri ad un numero
   Esempio di utilizzo:
   
   prefixZeros(100, 5); 
   
   Restituisce:
   
   00100
*/
function prefixZeros(number, maxDigits) 
{  
    var length = maxDigits - number.toString().length;
    if(length <= 0)
        return number;

    var leadingZeros = new Array(length + 1);
    return leadingZeros.join('0') + number.toString();
}





