/**
 * util.js
 *
 * Utility functions for simpleplus extends native nodejs util module with
 * custom utility functions and returns
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
 * @author 		Royal Morris (royal@swensonhe.com)
 * @date 		July 25th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

/**
 * Set up log level based on env
 */
if (typeof LOGLEVEL != 'undefined') {
	var logLevel = LOGLEVEL;
} else if (process.env.NODE_ENV == 'production') {
	var logLevel = 'info'
} else {
	var logLevel = 'debug';
}

/**
 * Module dependencies
 */
var request = require('request')
  , async = require('async')
  , mongoose = require('mongoose')
  , ObjectId = mongoose.Types.ObjectId
  , colors = require('colors')
  , clone = require('clone')
  , extend = require('extend')
  , winstonC = require('winston')
  , path = require('path')
  , util = require('util')
  , errorcodes = require('../common/errorcodes')
  , errors = require('errors')
  , winston = new (winstonC.Logger)({
  		transports: [ new (winstonC.transports.Console)({ level: logLevel }) ]
  	});

var nativeExtended = false;

/**
 * Initialize utilities
 */
var Util = function (moduleName) {
	if (typeof moduleName != 'string') {
		throw new Error('Please provide a module name for the utilities');
	}

	this.moduleName = moduleName;

	if (!nativeExtended) {
		this.extendArray();
		this.extendString();
		this.extendBoolean();
		this.extendDate();
		if (!process.env.KEEP_CONSOLE) {
			this.extendConsole()
		} else {
			console.debug = console.log;
		}
		this.extendObjectId();
		this.extendErrors();
		this.extendObject();
	}

	nativeExtended = true;
}

/**
 * Native Error method extension
 */
Util.prototype.extendErrors = function () {
	var ErrorType = errorcodes.ErrorType;

	/**
	 * Top level error class
	 */
	(function () {
	    // create errors for each listed in the errcodes
	    for (var errorName in ErrorType) {
	        ErrorType[errorName].name = errorName;

	        if (Error[errorName]) throw new Error('Could not extend errors because property ' + errorName + ' already exists.');
	        Error[errorName] = errors.create(ErrorType[errorName]);
	    }
	})();
}

/**
 * Native Array method extension
 *
 * @returns {Function}
 */
Util.prototype.extendArray = function () {
	Array.prototype.objectSort = function (options) {
		var sortKey, sortDir, i = 0;
		for (var key in options) {
			sortKey = key;
			sortDir = options[key];
			i++;
		}

		if (i != 1) {
			throw new Error('Options in sort must be single key value pair');
		}
		return this.sort(function (a, b) {
			return sortDir * ( a[sortKey] - b[sortKey] );
		})
	}

	Array.prototype.findOne = function (query) {
		var result;
		var isOne;
		this.forEach(function (a, i) {
			isOne = true
			for (var key in query) {
				if (query[key] instanceof ObjectId) {
					query[key] = query[key].toString();
				}
				if (a[key] instanceof ObjectId) {
					a[key] = a[key].toString()
				}
				if (a[key] != query[key]) {
					isOne = false
				}
			}
			if (isOne) {
				result = a
			}
		})
		return result;
	}

	if (!Array.hasOwnProperty('contains')) {
		Array.prototype.contains = function (test) {
			if (this.indexOf(test) > -1) {
				return true;
			} else {
				return false;
			}
		}
	}

	Array.prototype.limit = function (lim) {
		if (!lim) return this;
		return this.splice(lim, this.length);
	}

	Array.prototype.skip = function (skip) {
		if (!skip) return this;
		return this.splice(0, skip);
	}

	Array.prototype.filterArray = function (toFilter) {
		if (!toFilter) throw new Error('Need an array');
		if (!Array.isArray(toFilter)) {
			toFilter = [toFilter]
		}

		return this.filter(function (i) {
			var shouldRemove = false;
			toFilter.forEach(function (f) {
				if (i == f) {
					shouldRemove = true;
				}
			})
			return !shouldRemove;
		})
	}

	Array.prototype.max = function() {
	  return Math.max.apply(null, this);
	};

	Array.prototype.min = function() {
	  return Math.min.apply(null, this);
	};
}

/**
 * Native String method extension
 *
 * @returns {Function}
 */
Util.prototype.extendString = function () {
	if (!String.hasOwnProperty('contains')) {
		String.prototype.contains = function (test) {
			if (this.indexOf(test) > -1) {
				return true;
			} else {
				return false;
			}
		}
	}
	// Convert to objectid
	String.prototype.idTouch = function () {
		return ObjectId(this);
	}
	String.prototype.boolTouch = function () {
		if (this == 'true') {
			return true;
		} else {
			return false;
		}
	}
	String.prototype.stringTouch = function () {
		return this;
	}
	String.prototype.replaceAll = function (find, replace) {
  		return this.replace(new RegExp(find, 'g'), replace);
	}
}

/**
 * Native Boolean method extension
 */
Util.prototype.extendBoolean = function () {
	Boolean.prototype.boolTouch = function () {
		return this;
	}
}

/**
 * Native ObjectId method extension
 *
 * @returns {Function}
 */
Util.prototype.extendObjectId = function () {
	// if object id already return
	ObjectId.prototype.idTouch = function () {
		return this;
	}
	ObjectId.prototype.stringTouch = function () {
		return this.toString();
	}
}


/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits (d) {
    if(0 <= d && d < 10) return '0' + d.toString();
    if(-10 < d && d < 0) return '-0' + (-1*d).toString();
    return d.toString();
}

/**
 * Native ObjectId method extension
 *
 * @returns {Function}
 */
Util.prototype.extendDate = function () {
	if (Date.prototype.pretty) throw new Error();

	Date.prototype.pretty = function (opts) {
		var options = { no_colors: false };
		extend(true, options, opts || {});

		// Puts in form '12/27/2013 16:36:37:123 (PST)'
		var l = new Date();
		// Set to PST
		var d = new Date(l.getTime() - 8 * 60 * 60 * 1000);
		var hrs, mins, secs, ms;
		// Convert hour to 2 digit number
		if (d.getUTCHours() < 10) {
			hrs = '0' + d.getUTCHours();
		} else {
			hrs = '' + d.getUTCHours();
		}
		// Convert min to 2 digit number
		if (d.getUTCMinutes() < 10) {
			mins = '0' + d.getUTCMinutes();
		} else {
			mins = '' + d.getUTCMinutes();
		}
		// Convert secs to 2 digit number
		if (d.getUTCSeconds() < 10) {
			secs = '0' + d.getUTCSeconds()
		} else {
			secs = '' + d.getUTCSeconds();
		}
		// Convert ms to 3 digit number
		if (d.getUTCMilliseconds() < 10) {
			ms = '00' + d.getUTCMilliseconds();
		} else if (d.getUTCMilliseconds() < 100) {
			ms = '0' + d.getUTCMilliseconds();
		} else {
			ms = '' + d.getUTCMilliseconds();
		}

		// Add colors if test environment
		var date = (d.getMonth() + 1) + '/' + (d.getDate()) + '/' + d.getFullYear();
		var time = hrs + ':' + mins + ':' + secs + ':';
		var tz = '(PST)'

		if (!options.no_colors && ( process.env.NODE_ENV == 'test' || process.env.NODE_ENV == 'local' || process.env.PORT == 31339)) {
			time = time.cyan;
			ms = ms.bold.cyan;
			tz = tz.grey;
		}
		// compose timestamp
		var timestamp =  date + ' - ' + time + ms + ' ' + tz;
		return timestamp;
	}

	Date.prototype.toMysqlFormat = function() {
	    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
	};

	Date.prototype.toSecs = function () {
		return Math.floor(this.getTime() / 1000);
	}

	Date.prototype.toAuthNetFormat = function() {
	    return this.getUTCFullYear() + "-" + twoDigits(this.getMonth() + 1);
	};
}

/**
 * Timezone Converter Method: ConvertFromLocalTime
 *
 * Converts from machine local time to other time zones.
 *
 * @param {Date} date, the date in local time.
 * @param {int} offset, the timezone offset from UTC time.
 */
Util.prototype.convertFromLocalTime = function (date, offset) {
	// Change date to milliseconds, then get the offset from UTC, and convert that to milliseconds.
	var utc = date.getTime() + date.getTimezoneOffset() * 60000;

	// Calculate the new date.
	var newDate = new Date( utc + 3600000 * offset );

	return newDate;
}


/**
 * Native console method extension
 *
 * @returns {Function}
 */
Util.prototype.extendConsole = function () {
	var me = this;
	var _console = clone(console);

	var printer = function (args, fn, line) {
		args = Array.prototype.slice.call(args, 0);
		var me = this;
		var d = new Date().pretty();
		if (!me.moduleName) me.moduleName = 'core';
		var date_str = d + ' ' + '[' + process.pid + ']' + ' [';
		if (line) date_str += line;
		date_str += ']';

		var toBePrinted = [];
		var currArgSet = [];
		args.forEach(function (val) {
			if (val instanceof Error && val.stack) {
				val = val.stack;
			} else if (typeof val == 'object') {
				var cache = [];
				var jVal = JSON.stringify(val, function(key, value) {
				    if (typeof value === 'object' && value !== null) {
				        if (cache.indexOf(value) !== -1) {
				            // Circular reference found, discard key
				            return;
				        }
				        // Store value in our collection
				        cache.push(value);
				    }
				    return value;
				}, 4);
				cache = null;
				val = jVal ? jVal : JSON.stringify(val, null, 4);
			}

			if (typeof val == 'string' && val.contains('\n')) {
				var holder = val.split('\n');
				currArgSet.push(holder[0]);
				toBePrinted.push(currArgSet);
				currArgSet = [];

				// Now remove first
				holder.shift();
				holder.forEach(function (v, i) {
					if (i == holder.length - 1) {
						currArgSet.push(v);
					} else {
						toBePrinted.push([v]);
					}
				})
			} else {
				currArgSet.push(val);
			}
		})

		toBePrinted.push(currArgSet);

		toBePrinted.forEach(function (args) {
			var toCheck = args.slice(1, args.length);
			var toRemove = [];

			toCheck.forEach(function (possInsert) {
				if (!args[0]) return false;
				else if (typeof args[0] != 'string' && args[0].toString)
					args[0] = args[0].toString();

				var s = args[0].indexOf('%s');
				var d = args[0].indexOf('%d');
				var replacer;

				if (s == -1 && d == -1) return;

				if (( s > -1 && d > -1 && s < d ) ||
					s > -1 && d == -1) {
					replacer = '%s';
				} else if (( d > -1 && s> -1 && d < s ) ||
					(d > -1 && s == -1 )) {
					replacer = '%d'
				} else {
					return false;
				}

				args[0] = args[0].replace(replacer, possInsert);

				toRemove.push(possInsert);
			})

			args = args.filter(function (a) {
				if (!toRemove.contains(a)) return true;
				else return false;
			})

			args.unshift(date_str)
			fn.apply(me, args);
		})
	}

	var Log = Error; // does this do anything?  proper inheritance...?
	Log.prototype._write = function (args, fn) {
		this.lineNumber = this.lineNumber ? this.lineNumber : extractLineNumberFromStack(this.stack);
		printer.call(me, args, fn, this.lineNumber);
	};

	var env = process.env.NODE_ENV;
	var _log = function () {
		Log()._write(arguments, winston.info);
	}

	var _error = function () {
		Log()._write(arguments, winston.error);
	}

	var _warn = function () {
		Log()._write(arguments, winston.warn);
	}

	var _debug = function () {
		var debug = function () {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift('debug');
			return winston.log.apply(winston, args);
		}
		Log()._write(arguments, debug);
	}

	var extractLineNumberFromStack = function (stack) {
		var line = stack.split('\n')[3];
		// fix for various display text
		line = ( line.indexOf(' (') >= 0
			? line.split(' (')[1].substring(0, line.length)
			: line.split('at ')[1]
			);
		if (line) {
			line = line.replace(path.dirname(__dirname), '');
			line = line.replace(')', '');
		}

		return line;
	};

	// /** Patch in Winston in production and beta*/
	if ('beta' == process.env.NODE_ENV ||
		'production' == process.env.NODE_ENV) {
		winston.add(winstonC.transports.DailyRotateFile, { dirname: path.join(__dirname, '../../../shared/log'), filename: process.env.NODE_ENV + '.winston.log', maxFiles: 14, level: logLevel })
	}

	console.error = (function () {
		if (this._is_off) { return; }
		return _error;
	})()
	console.log = (function () {
		if (this._is_off) { return; }
		return _log;
	})()
	console.warn = (function () {
		if (this._is_off) { return; }
		return _warn;
	})()
	console.debug = (function () {
		return _debug;
	})()
	console.turn_off = function () {
		this._is_off = true;
	}
	console.turn_on = function () {
		this._is_off = false;
	}

	var msToTime = function (s) {
		  var ms = s % 1000;
		  s = (s - ms) / 1000;
		  var secs = s % 60;
		  s = (s - secs) / 60;
		  var mins = s % 60;
		  var hrs = (s - mins) / 60;

		  if (mins < 10) mins = 0 + mins + '';
		  if (secs < 10) secs = 0 + secs + '';
		  return hrs + 'h ' + mins + 'm ' + secs + 's';
	}

	console.progressBar = function (percent, options) {
		if (!options) options = {};
		var barSize = options.barSize || 60;
		var message = options.message || 'Progress';
		var estimatedRem;
		if (this.lastStep && this.lastStep.percent < percent) {
			estimatedRem = msToTime(( Date.now() - this.lastStep.time ) * (1 - percent) / ( percent - this.lastStep.percent));
		} else {
			this.lastStep = {};
			estimatedRem = 'calculating...'
		}

		var numEquals = Math.ceil(percent * barSize);
		var percentPretty = Math.ceil(percent * 100) + '%'
		var equals = '';
		for (var i = 0; i < barSize; i++) {
			if (i < numEquals) {
				equals += '=';
			} else {
				equals += ' ';
			}
		}

		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(message + ": [\033[96m" + equals + '\033[39m] ' + percentPretty + '   Estimated time remaining: ' + estimatedRem);
		this.lastStep = { percent: percent, time: Date.now()}
	}

	console.startLoading = function () {
		var i = 0;  // dots counter
		this.loadingTimer = setInterval(function() {
		  process.stdout.clearLine();  // clear current text
		  process.stdout.cursorTo(0);  // move cursor to beginning of line
		  i = (i + 1) % 8;
		  var dots = new Array(i + 1).join(".");
		  process.stdout.write("Loading" + dots);  // write text
		}, 300);
	}

	console.stopLoading = function () {
		if (this.loadingTimer) {
			clearInterval(this.loadingTimer);
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			console.log('Loading complete!')
		}
	}
}

Util.prototype.getUSRegionInfo = function (state) {
	if (typeof state != 'string') throw new Error('Need to provide state as a two character string or full name');
	var uState = state.toLowerCase();

	var mapping = {
		al: { regionId: 1, code: 'AL', name: 'Alabama' },
		ak: { regionId: 2, code: 'AK', name: 'Alaska' },
		az: { regionId: 4, code: 'AZ', name: 'Arizona' },
		ar: { regionId: 5, code: 'AR', name: 'Arkansas' },
		ae: { regionId: 9, code: 'AE', name: 'Armed Forces Europe' },
		aa: { regionId: 7, code: 'AA', name: 'Armed Forces Americas' },
		ap: { regionId: 11, code: 'AP', name: 'Armed Forces Pacific' },
		ca: { regionId: 12, code: 'CA', name: 'California' },
		co: { regionId: 13, code: 'CO', name: 'Colorado' },
		ct: { regionId: 14, code: 'CT', name: 'Connecticut' },
		de: { regionId: 15, code: 'DE', name: 'Delaware' },
		dc: { regionId: 16, code: 'DC', name: 'District of Columbia' },
		fl: { regionId: 18, code: 'FL', name: 'Florida' },
		ga: { regionId: 19, code: 'GA', name: 'Georgia' },
		gu: { regionId: 20, code: 'GU', name: 'Guam' },
		hi: { regionId: 21, code: 'HI', name: 'Hawaii' },
		id: { regionId: 22, code: 'ID', name: 'Idaho' },
		il: { regionId: 23, code: 'IL', name: 'Illinois' },
		'in': { regionId: 24, code: 'IN', name: 'Indiana' },
		ia: { regionId: 25, code: 'IA', name: 'Iowa' },
		ks: { regionId: 26, code: 'KS', name: 'Kansas' },
		ky: { regionId: 27, code: 'KY', name: 'Kentucky' },
		la: { regionId: 28, code: 'LA', name: 'Louisiana' },
		me: { regionId: 29, code: 'ME', name: 'Maine' },
		md: { regionId: 31, code: 'MD', name: 'Maryland' },
		ma: { regionId: 32, code: 'MA', name: 'Massachusetts' },
		mi: { regionId: 33, code: 'MI', name: 'Michigan' },
		mn: { regionId: 34, code: 'MN', name: 'Minnesota' },
		ms: { regionId: 35, code: 'MS', name: 'Mississippi' },
		mo: { regionId: 36, code: 'MO', name: 'Missouri' },
		mt: { regionId: 37, code: 'MT', name: 'Montana' },
		ne: { regionId: 38, code: 'NE', name: 'Nebraska' },
		nv: { regionId: 39, code: 'NV', name: 'Nevada' },
		nh: { regionId: 40, code: 'NH', name: 'New Hampshire' },
		nj: { regionId: 41, code: 'NJ', name: 'New Jersey' },
		nm: { regionId: 42, code: 'NM', name: 'New Mexico' },
		ny: { regionId: 43, code: 'NY', name: 'New York' },
		nc: { regionId: 44, code: 'NC', name: 'North Carolina' },
		nd: { regionId: 45, code: 'ND', name: 'North Dakota' },
		oh: { regionId: 47, code: 'OH', name: 'Ohio' },
		ok: { regionId: 48, code: 'OK', name: 'Oklahoma' },
		or: { regionId: 49, code: 'OR', name: 'Oregon' },
		pa: { regionId: 51, code: 'PA', name: 'Pennsylvania' },
		pr: { regionId: 52, code: 'PR', name: 'Puerto Rico' },
		ri: { regionId: 53, code: 'RI', name: 'Rhode Island' },
		sc: { regionId: 54, code: 'SC', name: 'South Carolina' },
		sd: { regionId: 55, code: 'SD', name: 'South Dakota' },
		tn: { regionId: 56, code: 'TN', name: 'Tennessee' },
		tx: { regionId: 57, code: 'TX', name: 'Texas' },
		ut: { regionId: 58, code: 'UT', name: 'Utah' },
		vt: { regionId: 59, code: 'VT', name: 'Vermont' },
		vi: { regionId: 60, code: 'VI', name: 'Virgin Islands' },
		va: { regionId: 61, code: 'VA', name: 'Virginia' },
		wa: { regionId: 62, code: 'WA', name: 'Washington' },
		wv: { regionId: 63, code: 'WV', name: 'West Virginia' },
		wi: { regionId: 64, code: 'WI', name: 'Wisconsin' },
		wy: { regionId: 65, code: 'WY', name: 'Wyoming' }
	}

	if (uState.length > 2) {
		for (var abrv in mapping) {
			if (mapping[abrv].name.toLowerCase() == uState) {
				return mapping[abrv];
			}
		}
	} else {
		return mapping[uState];
	}
}

Util.prototype.extendObject = function () {
	Object.defineProperty(global, '__stack', {
	  get: function(){
	    var orig = Error.prepareStackTrace;
	    Error.prepareStackTrace = function(_, stack){ return stack; };
	    var err = new Error();
	    Error.captureStackTrace(err, arguments.callee);
	    var stack = err.stack;
	    Error.prepareStackTrace = orig;
	    return stack;
	  }
	});

	Object.defineProperty(global, '__line', {
	  get: function(){
	    return global.__stack[1].getLineNumber();
	  }
	});
}

/**
 * Bind a function to a context, optionally partially applying any arguments.
 *
 * @param fn
 * @param context
 * @returns {Function}
 */
Util.prototype.proxy = function (fn, context) {
	return function () {
        return fn.apply(context, arguments);
    };
};

/**
 * Bind a function to a context, optionally partially applying any arguments.
 *
 * @param fn
 * @param context
 * @returns {Function}
 */
Util.prototype.paramsValidator = function (args, params) {
	var message = 'Please provide the necessary argument: ';
	var failedKey;

	params.forEach(function (p) {
		if (args[p] === null ||
			args[p] === undefined) failedKey = p;
	})

	if (failedKey) {
		return new Error.Arguments(message + failedKey, null, message + failedKey);
	} else {
		return false;
	}
};

/**
 * Error printer
 *
 * If an error is thrown, then the error is printed, otherwise silenced
 *
 * @param {Error} err
 */
Util.prototype.errorPrinter = function (message) {
	var me = this;
	if (message instanceof Error) {
		me.error(message);
		return;
	}

	return function (err) {
		if (err && message) me.error(message);
		if (err) me.error(err);
	}
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
Util.prototype.randChar = function (len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * Exponential Backoff for deadlock
 *
 * Attempts to fire a function. If the function fails, prints error and waits 5
 * seconds before trying again. Then doubles the time after that
 *
 * @param {function} fn
 * @param {object} [scope]
 */
Util.prototype.deadlockRetry = function (scope, fn, cb) {
	var config = require('../config');
	if (!scope) scope = fn;
	if (!cb) cb = this.errorPrinter('Error in deadlock retry: ');
	var done = false;
	var currentPause = this.timeConstant(config.intervals.deadlockRetry / 2);
	var me = this;
	var maxTries = 5;
	var tries = 0;

	async.doWhilst(
		function (callback) {
			fn.call(scope, function (err) {
				tries++;
				if (tries == maxTries) {
					if (err) {
						me.error('Tried to execute function ' + maxTries + ' times, but deadlock error caused failure');
					} else {
						me.error('Maxed out.')
					}
					done = true;
					callback(err || new Error('Deadlock error cause failure.'));
				} else if (err && typeof err.faultString == 'string' &&
					(err.faultString.toLowerCase().contains('deadlock') ||
					err.faultString.contains('40001'))) {
					currentPause = currentPause * 2;
					me.error('Deadlock error. Trying again in ' + currentPause + ' seconds...');
					setTimeout(callback, currentPause * 1000)
				} else if (err) {
					done = true;
					callback(err);
				} else {
					done = true;
					callback(null);
				}
			})
		},
		function () { return !done },
		cb
	)
}

/**
 * Time constant
 *
 * This function reduces any time interval constants by the reduction factor
 * included in the configuration files
 *
 * @param {number} number
 */
Util.prototype.timeConstant = function (num) {
	var config = require('../config');
	if (typeof num != 'number') throw new Error('Please provided a number');

	return num / config.intervals.timeReductionFactor;
}

/**
 * Earliest ship date
 *
 * Gets the earliest ship date for a product by including weekends and holidays
 *
 * @param {number} estimatedShippingDaysNumber
 * @return {Date}
 */
Util.prototype.earliestShipDate = function (estimatedShippingDaysNumber, fromDate) {
	var config = require('../config');
	if (!estimatedShippingDaysNumber)
		estimatedShippingDaysNumber =
		this.timeConstant(config.intervals.subscriptionShippingDays);

	var date = fromDate || new Date();
    var result = '';
	var boolAfternoon = false;

    if(date.getHours() >= 13){
        boolAfternoon = true;
    }
    var boolFriday = false;
    if(date.getDay() == 5){
        boolFriday = true;
    }
    var boolSaturday = false;
    if(date.getDay() == 6){
        boolSaturday = true;
    }
    var boolSunday = false;
    if(date.getDay() === 0){
        boolSunday = true;
    }

    if(boolFriday && boolAfternoon) {  // if quote is created on Friday afternoon, add three days to estimation for the weekend
        estimatedShippingDaysNumber += this.timeConstant(3);
    }
    else if (boolSaturday) {  // if quote is created on Saturday, add two days to estimation for the weekend
        estimatedShippingDaysNumber += this.timeConstant(2);
    }
    else if (boolSunday) {  // if quote is created on Sunday, add one day to estimation for the rest of weekend
        estimatedShippingDaysNumber += this.timeConstant(1);
    }
    else if (boolAfternoon) {  // if quote is created after 1:00pm, add a day to the estimation.
        estimatedShippingDaysNumber += this.timeConstant(1);
    }

    // add days to current date to find estimated delivery date
    date = new Date(date.getTime() +
    	estimatedShippingDaysNumber * this.timeConstant(60 * 60 * 1000 * 24));

    var newDays = 0;
    // Adjust delivery date if the estimated date lands on a weekend.
    boolSaturday = false;
    if (date.getDay() == 6){
    	// if estimated date lands on a Saturday, push delivery to Monday
    	newDays += this.timeConstant(2);
    }
    boolSunday = false;
    if (date.getDay() === 0){
    	// if estimated date lands on a Sunday, push delivery to Tuesday
        newDays += this.timeConstant(2);
    }

    // Add the days to the date
    date = new Date(date.getTime() +
    	newDays * this.timeConstant(60 * 60 * 1000 * 24));

    // Finally, check to see if delivery date lands on a holiday, and if so,
    // extend to the next day
    var isHoliday = check_holiday(date);

    if (isHoliday){  // if estimated date lands on a holiday, add a day
		date = new Date(date.getTime() + this.timeConstant(60 * 60 * 1000));
    }

    return date;
}

/**
 * Check holiday
 *
 * Checks whether the day provided falls on a holiday
 *
 * @param {Date} dt_date
 * @return {boolean}
 */
function check_holiday (dt_date) {
	// check simple dates (month/date - no leading zeroes)

	var n_date = dt_date.getDate(),
		n_month = dt_date.getMonth() + 1;

	var s_date1 = n_month + '/' + n_date;

	if ( s_date1 == '1/1'   // New Year's Day
		|| s_date1 == '6/14'  // Flag Day
		|| s_date1 == '7/4'   // Independence Day
		|| s_date1 == '11/11' // Veterans Day
		|| s_date1 == '12/25' // Christmas Day
	) return true;

	// weekday from beginning of the month (month/num/day)
	var n_wday = dt_date.getDay(),
		n_wnum = Math.floor((n_date - 1) / 7) + 1;
	var s_date2 = n_month + '/' + n_wnum + '/' + n_wday;

	if ( s_date2 == '1/3/1'  // Birthday of Martin Luther King, third Monday in January
		|| s_date2 == '2/3/1'  // Washington's Birthday, third Monday in February
		|| s_date2 == '5/3/6'  // Armed Forces Day, third Saturday in May
		|| s_date2 == '9/1/1'  // Labor Day, first Monday in September
		|| s_date2 == '10/2/1' // Columbus Day, second Monday in October
		|| s_date2 == '11/4/4' // Thanksgiving Day, fourth Thursday in November
	) return true;

	// weekday number from end of the month (month/num/day)
	var dt_temp = new Date (dt_date);
	dt_temp.setDate(1);
	dt_temp.setMonth(dt_temp.getMonth() + 1);
	dt_temp.setDate(dt_temp.getDate() - 1);
	n_wnum = Math.floor((dt_temp.getDate() - n_date - 1) / 7) + 1;
	var s_date3 = n_month + '/' + n_wnum + '/' + n_wday;

	if (   s_date3 == '5/1/1'  // Memorial Day, last Monday in May
	) return true;

	// misc complex dates
	if (s_date1 == '1/20' && (((dt_date.getFullYear() - 1937) % 4) === 0)
	// Inauguration Day, January 20th every four years, starting in 1937.
	) return true;

	if (n_month == 11 && n_date >= 2 && n_date < 9 && n_wday == 2
	// Election Day, Tuesday on or after November 2.
	) return true;

	return false;
}


Util.prototype = extend(true, util, Util.prototype);

module.exports = function (moduleName) {
	var util = 	new Util(moduleName);

	util.log = console.log;
	util.error = console.error;
	util.warn = console.warn;
	util.debug = console.debug;

	return util;
}



































