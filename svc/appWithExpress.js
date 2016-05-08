"use strict";

var request = require('request');

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


function formatPhone(phoneNumber) {
    var numbers = phoneNumber.replace(/\D/g, ''),
        char = {0:'',3:'-',6:'-'};
    phoneNumber = '';
    for (var i = 0; i < numbers.length; i++) {
        phoneNumber += (char[i]||'') + numbers[i];
    }

    return phoneNumber;
}

app.post('/NewMessage', function(req,res) {
    console.log('getting the post');
    console.log('response = ' + req.body);
  //  for (var i=0; i < clients.length; i++) {
        // debugger;
         console.log('int the loop1');
         console.log('number of clients = ' + clients.length);
         var originalMessage = req.body;
         var fromPhone = originalMessage.message_number;
         console.log('from phone = ' + fromPhone);
         var newPhone = formatPhone(fromPhone);
         console.log('new phone = ' + newPhone);
         originalMessage.message_number = newPhone;
 
         var dateNow = new Date();
         var dateTime = dateNow.toLocaleDateString() + ' ' + dateNow.toLocaleTimeString();
         originalMessage.time = dateTime;

         //send to IBM son
         // Set the headers
         var user = 'c6940862-7018-4f9d-bfaf-995408476d91';
         var pass = 'zifxFcSTnwHH';
         var auth = new Buffer(user + ':' + pass).toString('base64');

         var headers = {
             'Content-Type':     'application/json',
             'Authorization': 'Basic ' + auth
         }

         // Configure the request
         var options = {
            url: 'https://gateway.watsonplatform.net/tone-analyzer-beta/api/v3/tone?version=2016-02-11',
            method: 'POST',
            headers: headers,
            json: { "text": originalMessage.message_text }
         }

         // Start the request
         request(options, function (error, response, body) {
            if (response.statusCode == 200) {
                console.log('IBM Watson replied ok');
                //console.log(response.body.document_tone);
                debugger;

                 originalMessage.message_tones = response.body.document_tone;
                 console.log(originalMessage.message_tones);
                 var messageToSend = JSON.stringify(originalMessage);
                 messageToSend = messageToSend.replace(/=>/g,':');
                 history.push(messageToSend);

                 for (var i=0; i < clients.length; i++) {
                     clients[i].sendUTF(messageToSend);
                 }
            }

            if (response.statusCode != 200){
                console.log(response);
            }
         })

         //var messageToSend = JSON.stringify(originalMessage);
         //messageToSend = messageToSend.replace(/=>/g,':');
         //history.push(messageToSend);
         //clients[i].sendUTF(messageToSend);
         //console.log('int the loop2');
    //}

   res.send('ok');
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

    // send back chat history
    for (var i=0; i < history.length; i++) {
        connection.sendUTF(history[i]);
    }
 
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
