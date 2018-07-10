const Usermanagement = require('usermanagement-cloudant');
// let usermanagement = new Usermanagement();
const methods = [
	'authenticateUser',
	'getActiveUsers',
	'getUser',
	'createUser',
	'syncRootUser'
];

function Wrapper(db_name) {
	let usermanagement = new Usermanagement({ db_name });
	for (let func of methods) {
		usermanagement[func + 'Cb'] = function() {
			let callback = arguments[arguments.length - 1];
			usermanagement[func](...arguments)
				.catch(err => {
					typeof err !== 'undefined' ? callback(err, null) : null;
				})
				.then(result => {
					typeof result !== 'undefined' ? callback(null, result) : null;
				});
		};
	}

	return usermanagement;
}

module.exports = Wrapper;
