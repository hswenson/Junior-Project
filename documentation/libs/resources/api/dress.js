/**
 * dress.js
 *
 * The resources for the analytic api; pulled into swagger 
 *
 * @author Hannah Swenson
 */

module.exports = [
	{
		spec: {
			path: '/dress/upload',
			summary: 'An endpoint to upload a dress image.',
			notes: 'A dress endpoint',
			method: 'POST',
			responseClass: 'Dress',
			params: [
				{
					paramType: 'form',
					name: 'size',
					description: 'Size of the dress',
					dataType: 'string',
					required: true
				},
				{
					paramType: 'form',
					name: 'color',
					description: 'The color of the dress',
					dataType: 'array(string)',
					required: true
				},
				{
					paramType: 'form',
					name: 'shape',
					dataType: 'string',
					required: true
				},
				{
					paramType: 'form',
					name: 'length',
					dataType: 'string',
					required: true
				},
				{
					paramType: 'form',
					name: 'name',
					dataType: 'string',
					required: true
				},
				{
					paramType: 'form',
					name: 'phone',
					dataType: 'string',
					required: true
				},
				{
					paramType: 'form',
					name: 'dorm',
					dataType: 'string',
					required: true
				},
				{
					paramType: 'form',
					name: 'email',
					dataType: 'string',
					required: true
				},
				{
					paramType: 'form',
					name: 'description',
					dataType: 'string',
					required: true
				}							
			],
			nickname: 'uploadDress'
		}
	},
	{
		spec: {
			path: '/dress/filter',
			summary: 'An endpoint to filter a dress image.',
			notes: 'A dress endpoint',
			method: 'POST',
			responseClass: 'Dress',
			params: [
				{
					paramType: 'form',
					name: 'size',
					description: 'Size of the dress',
					dataType: 'string'
				},
				{
					paramType: 'form',
					name: 'color',
					description: 'The color of the dress',
					dataType: 'array(string)'
				},
				{
					paramType: 'form',
					name: 'shape',
					dataType: 'string'
				},
				{
					paramType: 'form',
					name: 'length',
					dataType: 'string'
				},
				{
					paramType: 'form',
					name: 'limit',
					dataType: 'number'
				},
				{
					paramType: 'form',
					name: 'skip',
					dataType: 'number'
				}				
			],
			nickname: 'uploadDress'
		}
	}	
];