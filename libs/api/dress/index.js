/**
 * dress.js
 *
/**
 * Module dependencies
 */
var async = require('async')
  , config = require('../../../config')
  , models = require('../../../models');


/**
 * Models in use
 */
var Dress = models.Dress;
var User = models.User;

/**
 * Dress API
 */
var DressAPI = function () {
	this.$name = 'DressApi'
};

/**
 * upload a dress
 * @param size, length, shape, color, description, email, name, phone, dorm
 */
DressAPI.prototype.upload = function (args, ret) {
	User.getOrCreate(args.email, function (err, user) {
		if (err) return ret(err);

		user.set('name', args.name).set('phone', args.phone).set('dorm', args.dorm);
		user.save(function (err) {
			if (err) return ret(err);

			if (typeof args.color == 'string') {
				args.color = args.color.split(',');
			}

			var dress = Dress.make(args.size, args.color, args.length, args.shape, args.description, user._id)
			dress.set('url', args.file.path);
			dress.save(function (err) {
				if (err) return ret(err);

				return ret(null, dress);
			});

		});

	})
}

/**
 * filter dresses
 * @param blaaahhh
 */
DressAPI.prototype.filter = function (args, ret) {
	var filterObj = {};

	if (args.size != null) filterObj ['size'] = args.size;
	if (args.color != null) filterObj ['color'] = args.color;
	if (args.length != null) filterObj ['length'] = args.length;
	if (args.shape != null) filterObj ['shape'] = args.shape;

	Dress.filter(filterObj, args.limit, args.skip, { created: -1 }, ret);
}


// Device api singleton
module.exports = new DressAPI();
