/**
 * init.js
 *
 * Tests the iot magento module through the endpoint
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
 * @author      Nick Swenson (nick@swensonhe.com)
 * @date        July 14th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

/**
 * Module dependencies
 */
var async = require('async')
  , reporter = require('nodeunit').reporters.default
  , nodeunit = require('nodeunit')
  , utils = require('../../node_modules/nodeunit/lib/utils')
  , types = require('../../node_modules/nodeunit/lib/types')
  , path = require('path')
  , initialize = require('../../libs/initialize.js');


/**
 * Set stack trace limit
 */
//Error.stackTraceLimit = Infinity;

/**
 * Check for internet connectivity
 */
function init_internet (callback) {
    var timedOut = false;

    console.log(' Checking for internet connectivity...')
    var timer = setTimeout(function () {
        timedOut = true;
        console.log('  \033[31mError\033[0m: Internet test timed out, not all tests will run...')
        process.env.CONNECTIVITY = 'none';
        return callback(null);
    }, 1500);

    require('dns').lookup('www.google.com', function(err) {
        if (timedOut) {
            return;
        } else if (err) {
            console.log('  \033[31mError\033[0m: No internet connectivity, not all tests will run...')
            process.env.CONNECTIVITY = 'none';
        } else {
            console.log('  Connected to internet successfully!')
            process.env.CONNECTIVITY = 'alive';
        }
        console.log()
        clearTimeout(timer);
        return callback(null)
    });
}

/**
 * Application configuration
 */
function init_app (callback) {
    initialize.initApp(callback);
}

/**
 * Monkey patch nodeunit to show names better
 */
var _cached = nodeunit.runFiles;
nodeunit.runFiles = function (paths, opt) {
    var all_assertions = [];
    var options = types.options(opt);
    var start = new Date().getTime();

    if (!paths.length) {
        return options.done(types.assertionList(all_assertions));
    }

    utils.modulePaths(paths, function (err, files) {
        if (err) throw err;
        async.concatSeries(files, function (file, cb) {
            var arrName =
                (path.dirname(file) + '/' + path.basename(file)).split('/');
            var name =
                arrName[arrName.length - 2] + '/' + arrName[arrName.length - 1];
            nodeunit.runModule(name, require(file), options, cb);
        },
        function (err, all_assertions) {
            var end = new Date().getTime();
            nodeunit.done()
            var assertList = types.assertionList(all_assertions, end - start);
            options.done(assertList);
            if (assertList.failures() > 0) {
                process.exit(1);
            } else {
                process.exit(0);
            }
        });
    });
};

/**
 * Run set up
 */
async.series([
    init_app,
    init_internet,
],
function (err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    var path = [];
    switch (process.argv[2]) {
        case 'runall':
            path.push('./tests/api/.')
            break;

        case undefined:
            break;

        default:
            path = [process.argv[2]]
            break;
    }

    if (path.length) {
    	console.log('\033[96m Simplehuman IOT tests now beginning:\033[39m');
    	reporter.run(path);
   	}
})
