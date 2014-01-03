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

console.log(' [*] Listening on 0.0.0.0:9999' );
app.listen(9999, '0.0.0.0');

app.get('/:id/client', function (req, res) {
    res.sendfile('/1.html', {root: __dirname});
});

app.get('/:id', function(req, res){
  var ann = multiplexer.registerChannel(req.params.id);
  var connect = [];
  ann.on('connection', function(conn) {
      connect.push(conn);
      
      //conn.write('Ann says hi!');
      conn.on('data', function(data) {
        console.log('==== data ====');
        console.log(data);
        connect[0].write(data);
        /*
        for(var i=0; i<connect.length; i++){
          connect[i].write(data);
        }
        */
        //conn.write(data);
      });
  });
  //res.sendfile(__dirname + '/1.html');
  res.send({status:true});
});

app.get('/multiplex.js', function (req, res) {
    res.sendfile(__dirname + '/multiplex.js');
});
