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
 var path = require("path");
var webServer = require(path.join(process.cwd() + '/public/mymodules/webServer.js'));
var server_port = process.env.PORT || 3000;
var server_ip_address = undefined;//process.env.IP || '0.0.0.0';
//Crea il server
var ws = new webServer();
var force_https = false;
ws.open(server_port, server_ip_address,force_https);
