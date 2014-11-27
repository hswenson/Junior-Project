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
 * @author 		Nick Swenson (nick@swensonhe.com)
 * @date 		July 7th, 2014
 *
 */

var errors = {
	ErrorType: {
		Arguments: {
			code: 3001,
			defaultMessage: 'The arguments supplied did not match the specs.',
			defaultResponse: 'Something went wrong! Please try again.'
		},


		NotAuthorized: {
			code: 4001,
			status: 401,
			defaultMessage: 'The user is not authorized to access this endpoint',
			defaultResponse: 'You are not authorized to see this!'
		},

		Internal: {
			code: 5000,
			defaultMessage: 'Unspecified internal server error.',
			defaultResponse: 'We are sorry. We had an issue with our server. Please try again.'
		}
	}
}

module.exports = errors;
