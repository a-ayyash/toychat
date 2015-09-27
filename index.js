var http = require('http');
var url = require('url');
var fs  = require('fs');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'toychat',
      streams: [{
        level: 'info',
        path: 'var/log/toychat.log'// log INFO an above to stdout
      }, {
        level: 'error',
        path: 'var/log/toychat-error.log' // log ERROR and above to a file
      }]
});

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

function logEvent(_event, _msg, _id) {
  var JSON_event ={event: _event, id: _id};
  log.info(JSON_event, _msg);
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
  logEvent("connected","User connected successfully", socket.id);

  socket.on("disconnect", function(){
    logEvent("disconnected","User disconnected", socket.id);
  });

  socket.on("chat message", function(msg){
    logEvent("chat_message",msg, socket.id);
    io.emit('chat message', msg);
  });
});

