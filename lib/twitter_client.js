/*
 * This file is part of twitter-js
 *
 * Copyright (c) 2010 masylum <masylum@gmail.com>
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var url = require("url"),
    http = require('http'),
    OAuth = require('../../node-oauth').OAuth,
    querystring = require("querystring"),
    sys = require("sys");

module.exports = function (api_key, api_secret, redirect) {
  var client = {version: '0.0.3'},

  // PRIVATE
      oAuth = new OAuth(
        'https://twitter.com/oauth/request_token',
        'https://twitter.com/oauth/access_token',
        api_key,
        api_secret,
        '1.0',
        redirect,
        'HMAC-SHA1',
        null,
        {'Accept': '*/*', 'Connection': 'close', 'User-Agent': 'twitter-js ' + client.version}
      ),
      rest_base = 'https://api.twitter.com/1',
      //rest_base = 'http://localhost:5000/1',

      requestCallback = function (callback) {
        return function (error, data, response) {
          if (error) {
            callback(error, null);
          } else {
            try {
              callback(null, JSON.parse(data));
            } catch (exc) {
              callback(exc, null);
            }
          }
        };
      },

      get = function (path, params, token, callback) {
        oAuth.get(rest_base + path + '?' + querystring.stringify(params), token.oauth_token, token.oauth_token_secret, requestCallback(callback));
      },

      post = function (path, params, token, callback, contenttype) {
        oAuth.post(rest_base + path, token.oauth_token, token.oauth_token_secret, params, contenttype, requestCallback(callback));
      };

  // PUBLIC
  client.apiCall = function (access_token, access_token_secret, method, path, params, callback, contenttype) {
    var token = {oauth_token: access_token, oauth_token_secret: access_token_secret };

    if (method === 'GET') {
      get(path, params, token, callback);
    } else if (method === 'POST') {
      post(path, params, token, callback, contenttype);
    }
  };

  client.getAccessToken = function (request_token_secret, requestUrl,  callback) {

    var parsedUrl = url.parse(requestUrl, true);

    oAuth.getOAuthAccessToken(
      parsedUrl.query.oauth_token,
      request_token_secret,
      parsedUrl.query.oauth_verifier,
      function (error, oauth_token, oauth_token_secret, additionalParameters) {
        if (error) {
          callback(error, null);
        } else {
          callback(null, {oauth_token: oauth_token, oauth_token_secret: oauth_token_secret}, additionalParameters);
        }
      }
    );
  }

  client.getRequestToken = function (callback) {
    oAuth.getOAuthRequestToken(
      function (error, oauth_token, oauth_token_secret, oauth_authorize_url, additionalParameters) {
        if (!error) {
          callback(null, "http://api.twitter.com/oauth/authorize?oauth_token=" + oauth_token, oauth_token, oauth_token_secret);
        } else {
          callback(error);
        }
      }
    );
  };

  return client;
};
