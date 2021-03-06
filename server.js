var express = require('express');
var path = require('path')

var app = express();
//var bodyParser = require('body-parser');
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true }));

//use this for any folders that the HTML will consume
app.use(express.static(path.join(__dirname, 'what')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


app.get('/', function(req,res) {
  var file = __dirname + "/what/index.html";
  console.log(file);
  res.sendFile(file);

});

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
