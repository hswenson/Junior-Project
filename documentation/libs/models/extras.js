/**
 * extras.js
 *
 * Models that are appended to the Mongoose models for the API
 *
 * @author Nick Swenson
 */

module.exports = function () {
	return {
		StorageMin: {
			id: 'StorageMin',

			properties: {				
				deviceId: {
					type: 'string',
					description: 'The id of the device.'
				},
				_id: {
					type: 'string',
					description: 'The string id for the new data chunk.'
				},
				result: {
					type: 'number',
					description: 'The response of status from the server. If 1, the request was successful. Otherwise the error code of the failure.'
				},
				uSec: {
					type: 'number',
					description: 'The second timestamp of the response'
				}
			}
		},

		StorageArr: {
			id: 'StorageArr',

			properties: {
				deviceId: {
					type: 'string',
					description: 'The id of the device'
				},
				TYPE: {
					value: {
						type: 'mixed',
						description: 'The value of the parameter TYPE'
					},

					uSec: {
						type: 'number',
						description: 'The timestamp in seconds when the value was supplied'
					}
				}
			}
		}						
	}
}()