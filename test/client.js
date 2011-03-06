/**
 * IMPORTANT:
 * In order to make this test work add
 * 127.0.0.1 twitter-js to your /etc/hosts
 */

process.sparkEnv = process.sparkEnv || {};

var express = require('express'),
    connect = require('connect'),
    twitterClient = require('./../')(
      process.sparkEnv.twitterKey,
      process.sparkEnv.twitterPass,
      'http://localhost:3003/'
    ),
    app = express.createServer(
      connect.bodyDecoder(),
      connect.cookieDecoder(),
connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }})
    );

app.set('views', __dirname);

app.get('/', function (req, res) {
  twitterClient.getAccessToken(req, res, function (error, token, extras) {
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
  twitterClient.apiCall(
    'POST',
    '/statuses/update.json',
    {token: {oauth_token_secret: req.session.auth.newsecret, oauth_token: req.session.auth.newtoken},status: req.param('message')},
    function (error, result) {
      console.log(error);
      console.log(result);
      res.render('client.jade', {layout: false});
    }
  );
});

app.get('/verify', function (req, res) {
  console.log(req.session);
  twitterClient.apiCall(
    'GET',
    '/account/verify_credentials.json',
    {token: {oauth_token_secret: req.session.auth.newsecret, oauth_token: req.session.auth.newtoken}},
    function (error, result) {
      console.log(error);
      console.log(result);
      res.render('client.jade', {layout: false});
    }
  );
});

app.get('/image', function (req, res) {
  console.log(req.session);
  twitterClient.apiCall(
    'GET',
    '/users/profile_image/.json',
    {token: {oauth_token_secret: req.session.auth.newsecret, oauth_token: req.session.auth.newtoken}, size:'bigger'},
    function (error, result) {
      console.log(error);
      console.log(result);
      res.render('client.jade', {layout: false});
    }
  );
});

module.exports = app;
