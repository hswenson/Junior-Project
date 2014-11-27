/**
 * data.js
 *
 * Mapping of data models from Simpleplus backend to Magento data models
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
 * @date 		July 22nd, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

/**
 * Module dependencies
 */
var util = require('../../libs/util.js')('data')
  , ObjectId = require('mongoose').Types.ObjectId
  , enums = require('../../common/enums');

/**
 * Test Users
 */
var testUsers = exports.testUsers = [{
	_id: ObjectId(),
	email: 'test@swensonhe.com',
	firstname: 'Test',
	lastname: 'Api',
	apiKey: 'password123',
	salt: 'Af',
	level: enums.PrivilegeLevel.User
}]

/**
 * Test storages
 */
var deviceId1 = 'testDevice1';
var deviceId2 = 'testDevice2';

exports.testStoragesDevice1 = [{
	deviceId: deviceId1,
	ip: '1.1.1.1',
	payload: { batteryLife: '1', temperature: '11', PIP: '1.1.1.1' },
	userId: testUsers[0]._id
},
{
	deviceId: deviceId1,
	ip: '1.1.1.1',
	payload: { batteryLife: '2', PIP: '1.1.1.1' },
	userId: testUsers[0]._id
},
{
	deviceId: deviceId1,
	ip: '2.2.2.2',
	payload: { batteryLife: '1', PIP: '2.2.2.2' },
	userId: testUsers[0]._id
},
{
	deviceId: deviceId1,
	ip: '2.2.2.2',
	payload: { batteryLife: '2', temperature: '22', PIP: '2.2.2.2' },
	userId: testUsers[0]._id
},
{
	deviceId: deviceId1,
	ip: '2.2.2.2',
	payload: { batteryLife: '3', PIP: '2.2.2.2' },
	userId: testUsers[0]._id
}]

exports.testStoragesDevice2 = [{
	deviceId: deviceId2,
	ip: '1.1.1.1',
	payload: { batteryLife: '1', temperature: '111', PIP: '1.1.1.1' },
	userId: testUsers[0]._id
},
{
	deviceId: deviceId2,
	ip: '1.1.1.1',
	payload: { batteryLife: '2', PIP: '1.1.1.1' },
	userId: testUsers[0]._id
},
{
	deviceId: deviceId2,
	ip: '2.2.2.2',
	payload: { batteryLife: '1', PIP: '2.2.2.2' },
	userId: testUsers[0]._id
},
{
	deviceId: deviceId2,
	ip: '2.2.2.2',
	payload: { batteryLife: '2', temperature: '222', PIP: '2.2.2.2' },
	userId: testUsers[0]._id
},
{
	deviceId: deviceId2,
	ip: '2.2.2.2',
	payload: { batteryLife: '3', PIP: '2.2.2.2' },
	userId: testUsers[0]._id
}]
