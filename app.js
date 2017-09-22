var path = require("path");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var app = express();
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
var entries = [];
app.locals.entries = entries;
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.get("/", function(request, response) 
   {
      response.render("index");
   });
/*   
app.get("/new-entry", function(request, response)
  {
    response.render("new-entry");
  });   
app.post("/new-entry", function(request, response) 
  {
     if (!request.body.title || !request.body.body) 
     {
        response.status(400).send("Entries must have a title and a body.");
        return;
     }
     entries.push({title: request.body.title,body: request.body.body,published: new Date()});
     response.redirect("/");
  });
*/
app.use(function(request, response) 
  {
	  response.status(404).render("404");
  });
var port =  process.env.OPENSHIFT_NODEJS_PORT || 3000;   // Port 3000 if you run locally 
var address =  process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"; // Listening to localhost if you run locally 
var listener = app.listen(port, address, function(){
     console.log("MyTrakking app started on address "+address);
     console.log("MyTrakking app started on port "+port);
});  
