/**
 * dress.js
 *
 * dress model for a dress photo
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

	shape:
		{ type: String, required: true},

	description:
		{ type: String, required: true},

	userId:
		{ type: mongoose.Schema.Types.ObjectId, required: true},

	url: 
		{ type: String, required: true},

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
 * @param {string} shape;
 * @param {string} description;
 * @param {objectId} userId;
 */
dressSchema.statics.make = function (size, color, length, shape, description, userId) {
	var Dress = this;
	return new Dress({
		size: size,
		color: color,
		length: length,
		shape: shape,
		description: description,
		userId: userId
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

	this.find(filterObj).limit(limit).skip(skip).sort(sort).exec(callback);
}

/******************************************************
 * 				AUTHORIZATION METHODS				  *
 ******************************************************/


module.exports = mongoose.JP.model('Dress', dressSchema);
