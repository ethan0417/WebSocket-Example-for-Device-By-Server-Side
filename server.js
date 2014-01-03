var express             = require('express');
var sockjs              = require('sockjs');

var websocket_multiplex = require('websocket-multiplex');

// 1. Setup SockJS server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var service = sockjs.createServer(sockjs_opts);


// 2. Setup multiplexing
var multiplexer = new websocket_multiplex.MultiplexServer(service);


// 3. Express server
var app = express.createServer();
service.installHandlers(app, {prefix:'/multiplex'});

console.log('Listening on your.machine.ip:3000' );
app.listen(3000, '0.0.0.0');

app.get('/:id/client', function (req, res) {
    res.sendfile('/1.html', {root: __dirname});
});

app.get('/:id', function(req, res){
  var ann = multiplexer.registerChannel(req.params.id);
  var connect = [];
  ann.on('connection', function(conn) {
      connect.push(conn);
      console.log(connect);
      conn.on('data', function(data) {
        connect[0].write(data);
      });
      conn.on('close', function(){
        console.log('close connect : '+ connect.indexOf(conn));
        connect.splice(connect.indexOf(conn), 1);
      });
  });
  res.send({status:true});
});

app.get('/multiplex.js', function (req, res) {
    res.sendfile(__dirname + '/multiplex.js');
});
