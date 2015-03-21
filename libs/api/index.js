/**
 * index.js
 */

/**
 * Module dependencies
 */
var DressAPI = require('./dress');
var UserAPI = require('./user');
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

Api.prototype.user = UserAPI;


module.exports = new Api();

