/**
 * user.js
 * 
 * Model layer for the user
 *
 * @author Hannah Swenson
 */

/**
 * Module dependencies
 */
var async = require('async')
  , mongoose = require('mongoose')
  , enums = require('../common/enums.js');

/**
 * Variables in use
 */
var PrivilegeLevel = enums.PrivilegeLevel;

/**
 * Initialize
 */
var userSchema = new mongoose.Schema({
	/* Properties */
	email:
		{ type: String, required: true,
			default: PrivilegeLevel.Guest },

	_EMAIL:
		{ type: String, uppercase: true },

	name:
		{ type: String },

	phone:
		{ type: String },
	dorm:
		{ type: String },

	created:
		{ type: Date, default: Date.now }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ _EMAIL: 1 });

/******************************************************
 * 					PRE-SAVE METHODS				  *
 ******************************************************/
userSchema.pre('save', function (next) {
	if (this.isModified('email')) {
		this.set('_EMAIL', this.get('email'));
	}

	next(null);
})

/**
 * Make a user
 *
 * @param {string} email;
 */
userSchema.statics.make = function (email) {
	var User = this;
	return new User({ email: email })
}

/******************************************************
 * 				ACCESSOR METHODS					  *
 ******************************************************/

/**
 * Get or create a user by id 
 *
 * @param {string} userId
 */
userSchema.statics.getById = function (userId, callback) {
	this.findOne({ _id: userId }).exec(callback);
}

/**
 * Get or create a user by email 
 *
 * @param {string} email
 */
userSchema.statics.getByEmail = function (email, callback) {
	var User = this;
	if (typeof email == 'string') email = email.toUpperCase();

	User.findOne({ _EMAIL: email }).exec(callback);
}

/**
 * Get or create a user by email 
 *
 * @param {string} email
 */
userSchema.statics.getOrCreate = function (email, callback) {
	var User = this;
	var user;

	async.series([
		// Get the user if exists
		function (cb) {			
			User.getByEmail(email, function (err, u) {
				if (err) return cb(err);
				else if (u) {
					user = u;
					cb(null);
				} else cb(null)
			})
		},

		// If no user, create by email
		function (cb) {
			if (user) return cb(null);
			
			user = User.make(email);
			user.save(cb);
		}
	], function (err) {	
		if (err) return callback(err)

		return callback(null, user);
	})
}

module.exports = mongoose.jp.model('User', userSchema);
