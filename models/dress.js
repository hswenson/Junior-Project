/**
 * dress.js
 *
 * dress model for a dress photo
/**
 * Module dependencies
 */
var async = require('async')
  , mongoose = require('mongoose')
  , enums = require('../common/enums.js');


/**
 * Initialize
 */
var dressSchema = new mongoose.Schema({
	/* Properties */
	size:
		{ type: String, required: true},

	color: 
		{type: [String], required: true}, 

	length:
		{ type: String, required: true},

	description:
		{ type: String, required: true},

	brand:
		{ type: String, required: true},		

	userId:
		{ type: mongoose.Schema.Types.ObjectId, required: true},

	imagedata: 
		{ type: String, required: false},

	contenttype:
		{ type: String, required: false},

	created:
		{ type: Date, default: Date.now }
});

dressSchema.index( {size: 1, color: 1, length: 1, shape: 1} );

/**
 * Make a dress
 *
 * @param {string} size;
 * @param {string array} color;
 * @param {string} length;
 * @param {string} description;
 * @param {objectId} userId;
 */
dressSchema.statics.make = function (size, color, length, description, userId, brand) {
	var Dress = this;
	return new Dress({
		size: size,
		color: color,
		length: length,
		description: description,
		userId: userId,
		brand: brand		
	})
}

/******************************************************
 * 				ACCESSOR METHODS					  *
 ******************************************************/

/**
 * Get by size
 *
 * @param {string} size
 */
dressSchema.statics.filter = function(filterObj, limit, skip, sort, callback) {
	var dress;
	var me = this;
	var User = mongoose.jp.model('User');

	async.series([
		// Get the user
		function (cb) {
			if (!filterObj.email) return cb(null);

			User.getOrCreate(filterObj.email, function (err, u) {
				if (err) return cb(err);
				else if (!u) return cb(new Error('User not found'));

				delete filterObj.email;
				filterObj['userId'] = u._id;
				return cb(null);
			})
		},

		// Filter
		function (cb) {
			me.find(filterObj).limit(limit).skip(skip).sort(sort).exec(callback);
		}
	], callback)
}

/******************************************************
 * 				AUTHORIZATION METHODS				  *
 ******************************************************/


module.exports = mongoose.jp.model('Dress', dressSchema);
