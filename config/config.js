/**
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

                replset: {
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
