/**
 * user.js
 *
/**
 * Module dependencies
 */
var async = require('async')
  , config = require('../../../config')
  , models = require('../../../models')
  , fs = require('fs');


/**
 * Models in use
 */
var Dress = models.Dress;
var User = models.User;

/**
 * Dress API
 */
var UserAPI = function () {
	this.$name = 'UserAPI'
};

/**
 * upload a dress
 * @param size, length, shape, color, description, email, name, phone, dorm
 */
UserAPI.prototype.get = function (args, ret) {
	User.getOrCreate(args.email, function (err, user) {
		if (err) return ret(err);

		return ret(null, user);
	})
}

// Device api singleton
module.exports = new UserAPI();
