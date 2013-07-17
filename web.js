var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.use(express.static(__dirname + '/'));

var page = fs.readFileSync('index.html').toString();

// reload index.html when its content changes
var sameChange = false;
fs.watch('index.html', function (event, filename) {
  if (event === 'change' && filename && filename === 'index.html') {

    // saving index.html triggers 3 changes, but we only want to reload once
    if (!sameChange) {
      setTimeout(function () { 
        console.log("Reloading " + filename);
        page = fs.readFileSync('index.html').toString();
        sameChange = false;
      }, 250);

      sameChange = true;
    }
  }
});

app.get('/', function(request, response) {
  console.log("Got request with useragent " + request.headers['user-agent']);
  response.send(page);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
