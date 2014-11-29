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

	Date.prototype.toSecs = function () {
		return Math.floor(this.getTime() / 1000);
	}
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


Util.prototype = extend(true, util, Util.prototype);

module.exports = function (moduleName) {
	var util = 	new Util(moduleName);

	util.log = console.log;
	util.error = console.error;
	util.warn = console.warn;
	util.debug = console.debug;

	return util;
}



































