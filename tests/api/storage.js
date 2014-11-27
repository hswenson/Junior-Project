/**
 * couponCode.js
 *
 * Tests the coupon code api
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
 * @date 		August 25th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

/**
 * Module dependencies
 */
var util = require('../../libs/util')('customer')
  , async = require('async')
  , clone = require('clone')
  , enums = require('../../common/enums')
  , Context = require('../../libs/context')
  , MongoData = require('../data/mongodb.js')
  , Api = require('../../libs/api')
  , models = require('../../models');

var User = models.User
  , Storage = models.Storage;
var PrivilegeLevel = enums.PrivilegeLevel;
var storageMap;
/**
 * Log to storages
 */
exports.log = {
	setUp: function (callback) {
		async.series([
			util.proxy(MongoData.removeAll, MongoData),
			util.proxy(MongoData.loadGuestContext, MongoData)
		], callback)
	},
	tearDown: function (callback) {
		async.series([
			util.proxy(MongoData.removeAll, MongoData)
		], callback)
	}
};

// Gets a coupon code in the guest context
exports.log['log to storages'] = function (test) {
	test.expect(7);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: 'testDevice1',
		testParam1: 'testValue1',
		testParam2: 'testValue2'
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.log.call(GuestContext, args, function (err, res) {
				test.equal(res.result, 1, 'Result should equal 1');
				test.ok(typeof res.uSec == 'number', 'Should be a number');
				test.ok(typeof res._id == 'string', 'Should be a string');
				cb(null);
			})
		},

		// Grab storage and manually check
		function (cb) {
			Storage.findOne({ deviceId: args.deviceId }).exec(function (err, storage) {
				test.ok(storage, 'Should have a storage');
				test.equal(storage.payload.testParam1, args.testParam1, 'Should have a test param');
				test.equal(storage.payload.testParam2, args.testParam2, 'Should have a second param');
				test.equal(storage.fields.length, 3, 'Should have 3 fields');
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.log['log to storages - error'] = function (test) {
	test.expect(2);

	var GuestContext = MongoData.guestContext;
	var args = {
		testParam1: 'testValue1',
		testParam2: 'testValue2'
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.log.call(GuestContext, args, function (err, res) {
				test.ok(err, 'Should have thrown an error');
				cb(null);
			})
		},

		// Grab storage and manually check
		function (cb) {
			Storage.findOne({ deviceId: args.deviceId }).exec(function (err, storage) {
				test.ok(!storage, 'Should not have storage');
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

/**
 * Get from storages
 */
exports.get = {
	setUp: function (callback) {
		async.series([
			util.proxy(MongoData.removeAll, MongoData),
			util.proxy(MongoData.loadGuestContext, MongoData),
			util.proxy(MongoData.createTestStoragesDevice1, MongoData)
		], callback)
	},
	tearDown: function (callback) {
		async.series([
			util.proxy(MongoData.removeAll, MongoData)
		], callback)
	}
};

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - single param'] = function (test) {
	test.expect(3);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0]
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.ok(res[0][args.type], 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		},

		// Grab storage and manually check
		function (cb) {
			var query = { deviceId: storageMap.deviceId };
			query['payload.' + args.type] = storageMap[args.type][0].value;

			Storage.findOne(query).exec(function (err, storage) {
				test.equal(Math.floor(storage.created.getTime() / 1000), storageMap[args.type][0].uSec, 'Should have the same created time');
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - PIP only'] = function (test) {
	test.expect(3);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: 'PIP'
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.ok(res[0][args.type].length, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		},

		// Grab storage and manually check
		function (cb) {
			var query = { deviceId: storageMap.deviceId };
			query.ip = storageMap[args.type][0].value;

			Storage.findOne(query).exec(function (err, storage) {
				test.equal(Math.floor(storage.created.getTime() / 1000), storageMap[args.type][0].uSec, 'Should have the same created time');
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - single param created query'] = function (test) {
	test.expect(3);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0],
		createdQuery: { $gt: 0 }
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.ok(res[0][args.type], 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		},

		// Grab storage and manually check
		function (cb) {
			var query = { deviceId: storageMap.deviceId };
			query['payload.' + args.type] = storageMap[args.type][0].value;
			Storage.findOne(query).exec(function (err, storage) {
				test.equal(Math.floor(storage.created.getTime() / 1000), storageMap[args.type][0].uSec, 'Should have the same created time');
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - single param multiple docs'] = function (test) {
	test.expect(3);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0],
		history: 3
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res[0][args.type].length == 3, 'Should be array');
				test.ok(res[0][args.type], 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		},

		// Grab storage and manually check
		function (cb) {
			var query = { deviceId: storageMap.deviceId };
			query['payload.' + args.type] = storageMap[args.type][0].value;
			Storage.findOne(query).exec(function (err, storage) {
				test.equal(Math.floor(storage.created.getTime() / 1000), storageMap[args.type][0].uSec, 'Should have the same created time');
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - single param getFrom'] = function (test) {
	test.expect(2);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0],
		getFrom: 'uC',
		history: 3
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.ok(res[0][args.type], 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - multiple param single doc'] = function (test) {
	test.expect(3);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0] + '&'
				 + Object.keys(MongoData.statics.storagesDevice1[0].payload)[1],
		history: 1
	}

	var typeArr = args.type.split('&');
	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.ok(res[0][typeArr[0]], 'Should have the parameter');
				test.ok(res[0][typeArr[1]], 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - multiple param multiple doc'] = function (test) {
	test.expect(5);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0] + '&'
				 + Object.keys(MongoData.statics.storagesDevice1[0].payload)[1],
		history: 2
	}

	var typeArr = args.type.split('&');
	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res[0][typeArr[0]].length == args.history, 'Should be array');
				test.ok(res[0][typeArr[0]], 'Should have the parameter');
				test.ok(res[0][typeArr[0]].length == 2, 'Should have the parameter');
				test.ok(res[0][typeArr[1]], 'Should have the parameter');
				test.ok(res[0][typeArr[1]].length == 2, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - multiple param out of range'] = function (test) {
	test.expect(4);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0] + '&'
				 + Object.keys(MongoData.statics.storagesDevice1[0].payload)[1],
		history: 3
	}

	var typeArr = args.type.split('&');
	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res[0][typeArr[0]].length == args.history, 'Should be array');
				test.ok(res[0][typeArr[0]], 'Should have the parameter');
				test.ok(res[0][typeArr[0]].length == args.history, 'Should have the parameter');
				test.ok(res[0][typeArr[1]].length == args.history - 1, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

exports.get['get from storages - device1 - max'] = function (test) {
	test.expect(4);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0] + '&'
				 + Object.keys(MongoData.statics.storagesDevice1[0].payload)[1],
		history: 0
	}

	var typeArr = args.type.split('&');
	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res[0][typeArr[0]].length == 5, 'Should be array');
				test.ok(res[0][typeArr[0]], 'Should have the parameter');
				test.ok(res[0][typeArr[0]].length == 5, 'Should have the parameter');
				test.ok(res[0][typeArr[1]].length == 2, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 - no param single doc'] = function (test) {
	test.expect(2);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		history: 1
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.equal(Object.keys(res[0]).length, 4, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 & createdQuery - no param single doc'] = function (test) {
	test.expect(2);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		history: 1,
		createdQuery: { $gt: 0 }
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.equal(Object.keys(res[0]).length, 4, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - device1 & ip & createdQuery - no param single doc'] = function (test) {
	test.expect(2);

	var GuestContext = MongoData.guestContext;
	var args = {
		deviceId: MongoData.statics.storagesDevice1[0].deviceId,
		history: 1,
		PIP: MongoData.statics.storagesDevice1[0].ip,
		createdQuery: { $gt: 0 }
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.equal(Object.keys(res[0]).length, 4, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - ip & createdQuery - no param single doc'] = function (test) {
	test.expect(2);

	var GuestContext = MongoData.guestContext;
	var args = {
		history: 1,
		PIP: MongoData.statics.storagesDevice1[0].ip,
		createdQuery: { $gt: 0 }
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.equal(Object.keys(res[0]).length, 4, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - createdQuery - no param single doc'] = function (test) {
	test.expect(2);

	var GuestContext = MongoData.guestContext;
	var args = {
		history: 1,
		createdQuery: { $gt: 0 }
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.equal(Object.keys(res[0]).length, 4, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

// Gets a coupon code in the guest context
exports.get['get from storages - ip - no param single doc'] = function (test) {
	test.expect(2);

	var GuestContext = MongoData.guestContext;
	var args = {
		history: 1,
		PIP: MongoData.statics.storagesDevice1[0].ip,
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 1, 'Should be array');
				test.equal(Object.keys(res[0]).length, 4, 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}


/**
 * Get from storages
 */
exports.getTwo = {
	setUp: function (callback) {
		async.series([
			util.proxy(MongoData.removeAll, MongoData),
			util.proxy(MongoData.loadGuestContext, MongoData),
			util.proxy(MongoData.createTestStoragesDevice1, MongoData),
			util.proxy(MongoData.createTestStoragesDevice2, MongoData)
		], callback)
	},
	tearDown: function (callback) {
		async.series([
			util.proxy(MongoData.removeAll, MongoData)
		], callback)
	}
};

exports.getTwo['get from storages - two devices - single param single lookup'] = function (test) {
	test.expect(3);

	var GuestContext = MongoData.guestContext;
	GuestContext.ip(MongoData.statics.storagesDevice1[0].ip);

	var args = {
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0],
		PIP: 'x.x.x.x'
	}

	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 2, 'Should be array');
				test.ok(res[0][args.type], 'Should have the parameter');
				test.ok(res[1][args.type], 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

exports.getTwo['get from storages - two devices - double param single lookup'] = function (test) {
	test.expect(5);

	var GuestContext = MongoData.guestContext;
	GuestContext.ip(MongoData.statics.storagesDevice1[0].ip);

	var args = {
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0] + '&'
				 + Object.keys(MongoData.statics.storagesDevice1[0].payload)[1],
		PIP: 'x.x.x.x'
	}

	var typeArr = args.type.split('&');
	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 2, 'Should be array');
				test.ok(res[0][typeArr[0]], 'Should have the parameter');
				test.ok(res[0][typeArr[1]], 'Should have the parameter');
				test.ok(res[1][typeArr[0]], 'Should have the parameter');
				test.ok(res[1][typeArr[1]], 'Should have the parameter');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

exports.getTwo['get from storages - two devices - double param two lookup'] = function (test) {
	test.expect(1);

	var GuestContext = MongoData.guestContext;
	GuestContext.ip(MongoData.statics.storagesDevice1[0].ip);

	var args = {
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0] + '&'
				 + Object.keys(MongoData.statics.storagesDevice1[0].payload)[1],
		PIP: 'x.x.x.x',
		history: 2
	}

	var typeArr = args.type.split('&');
	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == args.history, 'Should be array');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

exports.getTwo['get from storages - two devices - double param two lookup created query'] = function (test) {
	test.expect(1);

	var GuestContext = MongoData.guestContext;
	GuestContext.ip(MongoData.statics.storagesDevice1[0].ip);

	var args = {
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0] + '&'
				 + Object.keys(MongoData.statics.storagesDevice1[0].payload)[1],
		PIP: 'x.x.x.x',
		history: 2,
		createdQuery: { $gt: 0 }
	}

	var typeArr = args.type.split('&');
	async.series([
		// Log to storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == args.history, 'Should be array');
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

exports.getTwo['get from storages - two devices - ip lookup'] = function (test) {
	test.expect(4);

	var GuestContext = MongoData.guestContext;
	GuestContext.ip(MongoData.statics.storagesDevice1[0].ip);

	var storage1 = MongoData.statics.storagesDevice1[0];
	var args = {
		type: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0] + '&'
				 + Object.keys(MongoData.statics.storagesDevice1[0].payload)[1] + '&PIP',
		PIP: storage1.ip
	}

	var typeArr = args.type.split('&');
	async.series([
		// Get from storages
		function (cb) {
			Api.storage.get.call(GuestContext, args, function (err, res) {
				test.ok(Array.isArray(res) && res.length == 2, 'Should be array');
				test.equal(Object.keys(res[0]).length, 4, 'Should have 4 keys');
				test.equal(res[0][typeArr[0]].length, 1, 'Should have 1');
				test.equal(res[0]['PIP'][0].value, args.PIP)
				storageMap = res[0];
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}

/**
 * Get from storages
 */
exports.changeField = {
	setUp: function (callback) {
		async.series([
			util.proxy(MongoData.removeAll, MongoData),
			util.proxy(MongoData.loadGuestContext, MongoData),
			util.proxy(MongoData.createTestStoragesDevice1, MongoData),
			util.proxy(MongoData.createTestStoragesDevice2, MongoData)
		], callback)
	},
	tearDown: function (callback) {
		async.series([
			util.proxy(MongoData.removeAll, MongoData)
		], callback)
	}
};

exports.changeField['modify type name'] = function (test) {
	test.expect(3);

	var GuestContext = MongoData.guestContext;
	GuestContext.ip(MongoData.statics.storagesDevice1[0].ip);

	var args = {
		oldField: Object.keys(MongoData.statics.storagesDevice1[0].payload)[0],
		newField: 'new_type'
	}

	var firstCount;
	async.series([
		// Get old type count
		function (cb) {
			var query = {};
			query['payload.' + args.oldField] = { $exists: true };
			Storage.find(query, function (err, docs) {
				firstCount = docs.length;
				cb(null);
			})
		},
		// Log to storages
		function (cb) {
			Api.storage.modifyName.call(GuestContext, args, function (err, res) {
				test.ok(res.result, 'Should have been successful');
				test.ok(res.updated == firstCount, 'Should have updated a few documents');
				cb(null);
			})
		},

		// Check to see if changed
		function (cb) {
			var query = {};
			query['payload.' + args.newField] = { $exists: true };

			Storage.find(query, function (err, docs) {
				test.equal(firstCount, docs.length);
				cb(null);
			})
		}
	], function (err) {
		if (err) {
			console.log(err);
		}
		test.done();
	})
}





