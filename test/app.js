process.sparkEnv = process.sparkEnv || {};

var express = require('express'),
    connect = require('connect'),
    twitterClient = require('./../')(
      process.sparkEnv.twitterKey,
      process.sparkEnv.twitterPass,
      process.sparkEnv.twitterRedirect + "response"
    ),
    app = express.createServer(
      connect.bodyDecoder(),
      connect.cookieDecoder(),
      connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }})
    );

app.set('views', __dirname);

app.get('/login', function (req, res) {
  twitterClient.getRequestToken(req, res, function (error, token, extras) {
    console.log(extras);
    console.log(token);
    res.render('client.jade', {
      layout: false,
      locals: {
        token: token
      }
    });
  });
});
app.get('/response', function (req, res) {
  twitterClient.getAccessToken(req, function (error, token, extras) {
    console.log(extras);
    console.log(token);
    res.render('client.jade', {
      layout: false,
      locals: {
        token: token
      }
    });
  });
});

app.post('/message', function (req, res) {
  console.log(req.session);
  twitterClient.apiCall(req,
    'POST',
    '/statuses/update.json',
    {status: req.param('message')},
    function (error, result) {
      console.log(error);
      console.log(result);
      res.render('client.jade', {layout: false});
    }
  );
});

app.get('/verify', function (req, res) {
  console.log(req.session);
  twitterClient.apiCall(req,
    'GET',
    '/account/verify_credentials.json',
    {},
    function (error, result) {
      console.log(error);
      console.log(result);
      res.render('client.jade', {layout: false});
    }
  );
});

app.get('/image', function (req, res) {
  console.log(req.session);
  twitterClient.apiCall(req,
    'GET',
    '/users/profile_image/pithic.json',
    {size:'bigger'},
    function (error, result) {
      console.log(error);
      console.log(result);
      res.render('client.jade', {layout: false});
    }
  );
});

module.exports = app;
