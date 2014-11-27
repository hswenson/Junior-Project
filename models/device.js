/**
 * device.js
 *
 * device model for a device
 *
 *
 * NOTICE OF OWNERSHIP
 *
 * Written permission must be received from Simplehuman, LLC before any
 * modules, code or functionality contained within are copied, imitated or
 * reproduced in any way. This code was designed and prepared exclusively for
 * Simplehuman, LLC by Swenson He, LLC. Please contact the script author or
 * nick@swensonhe.com with questions.
 *
 * @author 		Nick Swenson (nick@swensonhe.com)
 * @author		Royal Morris (royal@swensonhe.com)
 * @date 		Aug 25th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

/**
 * Module dependencies
 */
var async = require('async')
  , mongoose = require('mongoose')
  , util = require('../libs/util')('modeldevice')
  , enums = require('../common/enums.js')
  , crypto = require('crypto')


/**
 * Variables in use
 */
var PrivilegeLevel = enums.PrivilegeLevel;

/**
 * Create md5 hash
 */
var md5Hash = function (str) {
	return crypto.createHash('md5').update(str, 'utf8')
				.digest('hex');
}

/**
 * Generate two random characters for salt
 *
 * @return {string}
 */
var genTwoRandChar = function () {
	return util.randChar(2);
}

/**
 * Initialize
 */
var deviceSchema = new mongoose.Schema({
	/* Properties */
	level:
		{ type: Number, required: true,
			default: PrivilegeLevel.Device },
	deviceId:
		{ type: String, required: true },

	salt:
		{ type: String, default: genTwoRandChar },
	apiKey:
		{ type: String },
	apiKeyHash:
		{ type: String },

	created:
		{ type: Date, default: Date.now }
});

deviceSchema.index({ deviceId: 1 }, { unique: true });

/******************************************************
 * 					PRE-SAVE METHODS				  *
 ******************************************************/
deviceSchema.pre('save', function (next) {
	var u = this;

	if (u.isModified('apiKey') && u.get('salt')) {
		u.hashApiKey();
	}
	next(null);
})

/**
 * Make a device
 *
 * @param {string} deviceId;
 * @param {string} apiKey
 */
deviceSchema.statics.make = function (deviceId, apiKey) {
	return this({
		deviceId: deviceId,
		apiKey: apiKey
	})
}

/******************************************************
 * 				ACCESSOR METHODS					  *
 ******************************************************/

/**
 * Get by deviceId
 *
 * @param {string} deviceId
 */
deviceSchema.statics.getByDeviceId = function (deviceId, callback) {
	var device;

	if (!deviceId || typeof deviceId != 'string')
		return callback(new Error('devicId must be provided'));

	this.findOne({ deviceId: deviceId }).exec(callback);
}

/******************************************************
 * 				AUTHORIZATION METHODS				  *
 ******************************************************/

/**
 * Device Method: hashPassword
 *
 * Hashes the apiKey to md5
 *
 * @return {bool}
 */
deviceSchema.methods.hashApiKey = function () {
	var toHash = this.get('salt') + this.get('apiKey');
	var hash = md5Hash(toHash);

	if (hash) {
		this.set('apiKey', hash);
		return true;
	} else return false;
}

/**
 * device Method: checkApiKey
 *
 * Checks to see if the provided password is valid
 * @param {string} apiKey
 * @return {bool}
 */
deviceSchema.methods.checkApiKey = function (apiKey) {
	var me = this;
	var toHash = this.get('salt') + apiKey;
	function hashCompare (str, preHash) {
		// Try hash
		var hash = md5Hash(str);

		if (hash == preHash) return true;

		return false;
	}
	return hashCompare(toHash, me.get('apiKey'));
}

module.exports = mongoose.iot.model('Device', deviceSchema);
