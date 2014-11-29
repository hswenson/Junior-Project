/**
 * index.js
 */

/**
 * Module dependencies
 */
var async = require('async')
  , mongoose = require('mongoose')
  , models = require('../../models')
  , config = require('../../config')  
  , enums = require('../../common/enums')
  , Swagger = require('../../libs/vendor/swagger')
  , modelMapper = require('./mapper.js')
  , pckg = require('../../package.json')
  , modelExtras = require('./models/extras.js')
  , extend = require('extend')
  , clone = require('clone');

/**
 * Pull in the Resources
 */
var APIresources = {
	dress: require('./resources/api/dress.js')
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





















