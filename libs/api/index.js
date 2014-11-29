/**
 * index.js
 */

/**
 * Module dependencies
 */
var DressAPI = require('./dress');

/**
 * Initialize API
 */
var Api = function () {
	this.$name = 'TopLevelAPI';
}

/**
 * Device functions
 */
Api.prototype.dress = DressAPI;

module.exports = new Api();

