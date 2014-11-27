/**
 * errorcodes.js
 *
 * Errorcode mapping for backend
 *
 *
 * NOTICE OF OWNERSHIP
 *
 * Written permission must be received from Swenson He, LLC before any
 * modules, code or functionality contained within are copied, imitated or
 * reproduced in any way. This code was designed and prepared exclusively by 
 * Swenson He, LLC. Please contact the script author or
 * nick@swensonhe.com with questions.
 *
 * @author      Nick Swenson (nick@swensonhe.com)
 * @date        July 7th, 2014
 *
 */

var enums = require('../common/enums.js')


module.exports = (function () {

    return {
        app: {
            host: 'localhost',
            ports: [
                { port: 6789 }
            ],
            api: {
            	prefix: '/api'
            },
        },

        mongo: {
    		options: {
    			server: {
                    auto_reconnect: true,
                    keepAlive: 1
                },
                db: {},
                safe: true
    		},
        	dbs: []
        }
    }
})()
