"use strict";

var history = [ ];
var clients = [ ];

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3057, function () {
  console.log('Example app listening on port 3057!');
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/NewMessage', function(req,res) {
    console.log('getting the post');
    console.log('response = ' + req.body);
    for (var i=0; i < clients.length; i++) {
        // debugger;
         console.log('int the loop1');
         console.log('number of clients = ' + clients.length);
         console.log('test = ' + req.body.test);
         //clients[i].sendUTF(req.body.test);
         var messageToSend = JSON.stringify(req.body);
         clients[i].sendUTF(messageToSend);
         console.log('int the loop2');
    }
});
 
// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';
 
// Port where we'll run the websocket server
var webSocketsServerPort = 1337;
 
// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
 
// HTTP server
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});

server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});
 
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just an enhanced HTTP request. 
    httpServer: server
});
 
// This callback function is called every time someone tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
 
    // accept connection - you should check 'request.origin' to make sure that client is connecting from your website
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    console.log((new Date()) + ' Connection accepted.');
 
    // user sent some message
    connection.on('message', function(message) {
        console.log(message);
        var request = JSON.parse(message.utf8Data);
        console.log('r u logging this?');
        if (message.type === 'utf8') { // accept only text
            console.log((new Date()) + ' Received Message from' + message.utf8Data);
                
            // we want to keep history of all sent messages
            var obj = {
                time: (new Date()).getTime(),
                text: request.text,
                userName: request.userName
            };
            history.push(obj);
            history = history.slice(-100);
 
            // broadcast message to all connected clients
            var json = JSON.stringify({ type:'message', data: obj });
            for (var i=0; i < clients.length; i++) {
                clients[i].sendUTF(json);
            }
        }
    });
 
    // user disconnected
    connection.on('close', function(connection) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected."); 
    });
 
});
