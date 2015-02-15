/**
 * errorcodes.js
 *
 * Errorcode mapping for backend
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
