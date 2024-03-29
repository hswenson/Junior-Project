/**
 * dress.js
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
var DressAPI = function () {
	this.$name = 'DressApi'
};

/**
 * upload a dress
 * @param size, length, shape, color, description, email, name, phone, dorm
 */
DressAPI.prototype.upload = function (args, ret) {
	if (!args.email) args.email = args.cookieEmail;
	User.getOrCreate(args.email, function (err, user) {
		if (err) return ret(err);

		if (args.name) user.set('name', args.name);
		if (args.phone) user.set('phone', args.phone);
		if (args.dorm) user.set('dorm', args.dorm);
		user.save(function (err) {
			if (err) return ret(err);

			if (typeof args.color == 'string') {
				args.color = args.color.split(',');
			}

			var dress = Dress.make(args.size, args.color, args.length, args.description, user._id, args.brand);

			var imagebuffer = fs.readFileSync(args.file.path);
			var base64image = imagebuffer.toString('base64');

			dress.set("contenttype", args.contentType);
			dress.set("imagedata", base64image);

			fs.unlinkSync(args.file.path);

			dress.save(function (err) {
				if (err) return ret(err);

				return ret(null, dress);
			});

		});

	})
}

DressAPI.prototype.delete = function (args, ret) {
	Dress.findById(args.dressId, function(err, dress) {
		if (err) return ret(err);

		console.log(args)

		if (!dress) return ret(null, true);


		dress.remove(ret);
	})

}

/**
 * filter dresses
 * @param blaaahhh
 */
DressAPI.prototype.filter = function (args, ret) {
	var filterObj = {};
	if (args.size) filterObj ['size'] = args.size;
	if (args.color) filterObj ['color'] = args.color;
	if (args.length) filterObj ['length'] = args.length;
	if (args.email) filterObj ['email'] = args.email;

	Dress.filter(filterObj, args.limit, args.skip, { created: -1 }, function (err, dresses) {
		if (err) ret(err);

		async.map(dresses, function (d, cb) {
			User.getById(d.get('userId'), function (err, u) {
				if (err) return cb(err);
				
				d.set('user', u, { strict: false });
				cb(null, d);
			})
		}, ret);
	});
}


// Device api singleton
module.exports = new DressAPI();
