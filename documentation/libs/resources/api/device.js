/**
 * device.js
 *
 * The resources for the analytic api; pulled into swagger 
 *
 * @author Nick Swenson
 * @author Royal Morris
 */

module.exports = [
	{
		spec: {
			path: '/device/register',
			summary: 'An endpoint to register an IOT device.',
			notes: 'The registration endpoint for a device. If a device is registered and not upgraded to an admin, it can only access itself as a device. It cannot access data from other devices.',
			method: 'POST',
			responseClass: '{ status: number, deviceId: string, uSec: number }',
			params: [
				{
					paramType: 'form',
					name: 'deviceId',
					description: 'The serial number for the product being created for. DeviceIds must be unique.',
					dataType: 'string',
					required: true
				}
			],
			nickname: 'registerDevice'
		}
	}
];