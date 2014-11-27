/**
 * index.js
 *
 * Aggregates the context classes
 */

/**
 * Module dependencies
 */
var Guest = require('./guest')
  , Device = require('./device')
  , Admin = require('./admin');


module.exports = {
	Guest: Guest,
	Device: Device,
	Admin: Admin
};
