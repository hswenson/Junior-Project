/**
 * app.js
 *
 * Documentation app for handling swagger
 *
 * @author Hannah Swenson
 */

/**
 * Parent dependencies
 */
var parent = module.parent.exports
  , app = parent.app
  , models = parent.models;

/**
 * Module dependencies
 */
var path = require('path')
  , express = require('express')
  , config = require('../config');

/**
 * configure express app to work with documentation site
 * @param app
 */
module.exports = function (app) {
    // routes for dashboard static files
    app.use('/docs', express.static(__dirname + '/public'));
    app.use('/docs/s', express.static(__dirname + '/static'));
};