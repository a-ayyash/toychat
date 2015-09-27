var http = require('http');
var url = require('url');
var fs  = require('fs');

function render200(response, message) {
    response.writeHead(200, {'Content-Type':'text/html'});
    response.write(message, 'utf8');
    response.end();
}

function pageNotFound(response) {
  response.writeHead(404);
  response.write("PAGE NOT FOUND");
  response.end();
}

var server = http.createServer(function(request, response){
  var path = url.parse(request.url).pathname;

  switch(path) {
    case '/':
      fs.readFile(__dirname+"/index.html", function(error, data){
        if (error) {
          pageNotFound(response);
        } else {
          render200(response, data);
        }
      });
      break;
    case '/socket.html':
      fs.readFile(__dirname + path, function(error, data){
        if (error) {
          pageNotFound(response);
        } else {
          render200(response, data);
        }
      });
      break;
    default:
        render200(response, "Nothing useful found");
      break;
  }
});

server.listen(8001);
var io = require('socket.io').listen(server);

io.sockets.on("connection", function(socket){
  console.log("a user is connected");

  socket.on("disconnect", function(){
    console.log("a user is disconnected");
  });

  socket.on("chat message", function(msg){
    console.log('message: '+msg);
    io.emit('chat message', msg);
  });
});

