var app = require('express')();

var PORT = 6661;

app.get('/name/:user', function(req, res) {
  res.status(200);
  res.set('Content-type', 'text/html');
  res.end('<html><body><h1>' + req.params.user + '</h1></body></html>');
});

app.listen(PORT, function() {
  console.log('Running on port:', PORT);
});