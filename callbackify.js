const Usermanagement = require('usermanagement-cloudant');
let usermanagement = new Usermanagement();
const methods = [
	'authenticateUser',
	'getActiveUsers',
	'getUser',
	'createUser',
	'syncRootUser'
];

for (let func of methods) {
	usermanagement[func + 'Cb'] = function () {
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

// sync root user at start up
usermanagement.syncRootUserCb((err, result) => {
	err ? console.error('root user could not be synced.', err.message) : null
});

module.exports = usermanagement;
