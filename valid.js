
const validator = require('is-my-json-valid');

const content = {
	type: "object",
      	properties: {
		type: {
			type: "string"
      		},
		content: {
			type: "string"
		},
		location: {
			type: "object",
			properties: {
				lat: {
					type: "number"
				},
				long: {
					type: "number"
				}
			},
			required: ["lat", "long"]
		}
	},
	required: ["type", "content", "location"]
};

module.exports = {
	validContent: (object) => {
		
		let validate = validator(content, {verbose:true});

		validate(object);

		return validate.errors;

	}

}


