/**
 * index.js
 *
 * Documentation
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
 * @author 		Nick Swenson (nick@swensonhe.com)
 * @date 		July 7th, 2014
 *
 */

/**
 * Module dependencies
 */
var async = require('async')
  , mongoose = require('mongoose')
  , models = require('../../models')
  , config = require('../../config')  
  , enums = require('../../common/enums')
  , ContextConstructor = require('../../libs/context')
  , Swagger = require('../../libs/vendor/swagger')
  , modelMapper = require('./mapper.js')
  , pckg = require('../../package.json')
  , modelExtras = require('./models/extras.js')
  , extend = require('extend')
  , clone = require('clone');

/**
 * Variables in use
 */
var Context = new ContextConstructor.Device({});

/**
 * Pull in the Resources
 */
var APIresources = {
	device: require('./resources/api/device.js')
}

var router = function (rcs, fn) {
	var adder = function (rc) {		
		switch (rc.spec.method) {
			case 'GET':
				fn.addGet(rc);
				break;

			case 'POST':
				fn.addPost(rc);
				break;
		}	
	}

	if (Array.isArray(rcs)) {
		rcs.forEach(adder);
	} else {
		adder(rcs);
	}
}

var modelExtender = function (swaggerModels, extenderModels) {
	var swaggerKey, extenderKey;
	var swaggerClone = clone(swaggerModels);

	for (extenderKey in extenderModels) {
		var extendKey = extenderModels[extenderKey].extend;
		var key = extenderModels[extenderKey].id || extenderKey;
		swaggerModels[key] = clone(extend(true, swaggerClone[extendKey], extenderModels[extenderKey]))
	}
	return swaggerModels;
}

var modelSanitizer = function (models) {
	for (var model in models) {
		models[model] = sanitizeModel(models[model]);
	}
	return models;
}

var sanitizeModel = function (model) {
	var properties = model.properties;
	if (Context['export' + model.id]) {
		properties = Context['export' + model.id](properties);
	}
	model.properties = properties;
	return model;
}

module.exports = function (app) {	
	var swaggerApi = new Swagger();

	/** REGISTER API **/
	swaggerApi.setAppHandler(app.apiApp);
	swaggerApi.configureSwaggerPaths("", "/api-docs", "");

	// Convert schema into swagger-ready
	var swaggerModels = modelMapper.map(models);

	// Extend any of the models with any in the extension or append
	extendedSwaggerModels = modelExtender(swaggerModels, modelExtras);

	// Sanitize models
	santitizedModels = modelSanitizer(extendedSwaggerModels);

	// Inject into swagger
	swaggerApi.addModels(santitizedModels);

	// Add resources to swagger
	for (var key in APIresources) {
		router(APIresources[key], swaggerApi);
	}

	swaggerApi.configure('http://' + config.app.host + ':' + config.app.ports[0].port + config.app.api.prefix, pckg.version);
	/** **************** **/	
}





















