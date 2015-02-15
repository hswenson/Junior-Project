/**
 * index.js
 *
 * Documentation
 *
 */

/**
 * Module dependencies
 */
var extend = require('extend')
  , mongoose = require('mongoose');

/**
 * Variables in use
 */
var ObjectIdSchema = mongoose.Schema.Types.ObjectId
  , ObjectId = mongoose.Types.ObjectId
  , Mixed = mongoose.Schema.Types.Mixed;

var typeReader = function (endType) {
	var type;
	switch (endType) {
		case ObjectId:
		case ObjectIdSchema:
		case String:
			type = 'String';
			break;

		case Array:
			type = 'Array';
			break;

		case Date:
			type = 'Date';
			break;

		case Number:
			type = 'Float';
			break;

		case Boolean:
			type = 'Boolean';
			break;

		case Object:
		case Mixed: 
			type = 'Mixed';
			break;

		default:		
			type = endType.modelName || endType.toString();			
			break;		
	}	

	return type;
}

var recursor = exports.recursor = function (obj) {
	var property = {};
	if (obj.required || obj.auto) {
		property.required = true;
	}
	if (obj.default && typeof obj.default == 'function') {
		property.defaultValue = obj.default.toString();
	} else if (obj.default) {
		property.defaultValue = obj.default;
	}

	if (!obj) {
		return {};
	} else if (typeof obj == 'function') {		
		property.type = typeReader(obj);
	} else if (typeof obj.type == 'function') {
		property.type = typeReader(obj.type);
	} else if (Array.isArray(obj)) {
		property.type = 'Array';
		property.items = recursor(obj[0])
	} else if (Array.isArray(obj.type)) {			
		property.type = 'Array';
		property.items = recursor(obj.type[0])
	} else if (typeof obj == 'object') {
		for (key in obj) {
			if (key != 'id' && key != '__v') {
				property[key] = recursor(obj[key]);
			}
		}
	}

	return property;
}

var mapping = function (model) {
	var schema = model.schema.tree;

	var properties = exports.recursor(schema);
	var swaggerModel = {
		id: model.modelName,
		properties: properties
	}

	return swaggerModel;
}


var map = exports.map = function (models) {
	// Run through all models
	var flat = {};
	for (var model in models) {
		if (!models[model].schema) {
			flat = extend(true, flat, map(models[model]));
		} else {
			flat[model] = mapping(models[model]);
		}
	}
	return flat;
}