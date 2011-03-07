process.sparkEnv = process.sparkEnv || {};
var fs = require('fs');
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
  req.session.auth = req.session.auth || {};
  twitterClient.getRequestToken(function (error, redirectUrl, request_token, request_token_secret) {
    if (error) {
      //TODO errorpage
    } else {
      req.session.auth.request_token = request_token;
      req.session.auth.request_token_secret = request_token_secret;
      res.redirect(redirectUrl);
    }
  });
});
app.get('/response', function (req, res) {
  twitterClient.getAccessToken(req.session.auth, req.url, function (error, token, extras) {
    req.session.auth = {
      access_token : token.oauth_token,
      access_token_secret : token.oauth_token_secret, 
      screen_name : extras.screen_name, 
      user_id: extras.user_id
    };
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
  twitterClient.apiCall(req.session.auth.access_token, req.session.auth.access_token_secret,
    'POST',
    '/statuses/update.json',
    {status: req.param('message')},
    function (error, result) {
      if (error) {
        console.log(error);
      } else {
        console.log("Returned");
        if (error) {
          console.log("error->");
          console.log(error);
        }
        console.log("result->");
        console.log(result);
        res.end();
      }
    }
  );
});

app.get('/image', function (req, res) {
  console.log(req.session);
  twitterClient.apiCall(null,null,
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

app.get('/postimage', function (req, res) {
  var buf = fs.readFileSync('elah.png');
  var boundary = '----WebKitFormBoundaryVKiDTIiEWXTPeyII';
  var contenttype ="multipart/form-data;boundary=" + boundary;

  var body = "--" + boundary + "\r\n";
  body += 'Content-Disposition: form-data; name="image"; filename="twobitme.png"\r\n';
  body += 'Content-Type: image/png\r\n\r\n';
  var footer = '\r\n';
  footer += '--' + boundary + '--\r\n';

  var pb = new Buffer(Buffer.byteLength(body,"ascii") + buf.length + Buffer.byteLength(footer,"ascii"));
  var counter = pb.write(body, 0, 'ascii');
  counter += buf.copy(pb, counter, 0, buf.length);
  counter += pb.write(footer, counter, "ascii");
  
  twitterClient.apiCall(req.session.auth.access_token, req.session.auth.access_token_secret,
    'POST',
    '/account/update_profile_image.json',
    pb,
    function (error, result) {
      console.log("Returned");
      if (error) {
        console.log("error->");
        console.log(error);
      }
      console.log("result->");
      console.log(result);
      res.end();
    },
    contenttype 
  );
});


module.exports = app;
