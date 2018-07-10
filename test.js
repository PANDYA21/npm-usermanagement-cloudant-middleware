process.env.VCAP_SERVICES = JSON.stringify({
	cloudantNoSQLDB: [{
		name: 'myCloduant',
		credentials: require('./cloudant_creds')
	}]
});

const UsermanagementRouter = require('.');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

let app = express();
app.use(logger('dev'));
app.use(bodyParser.json({
	limit: '1Gb'
}));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '1Gb'
}));


// auth and usermgmt
let usermanagementRouter = new UsermanagementRouter({
	parentRouter: app,
	cookieMaxAge: 2 * 1000 * 3600,
	base_path: '/',
	vcap_name: 'myCloduant'
});

/*
 * Order is important!
 * - Write all routes before using usermanagementRouter.router that are to be used without auth (e.g. public)
 * - All the other routes should be written after using usermanagementRouter.router.
 */

// routes without auth (before using usermanagementRouter.router)
app.get('/withoutauth', (req, res, next) => {
	res.status(200).json({ success: true, message: 'Should get it before login!' });
});

// auth and user-mgmt
app.use(usermanagementRouter.router);

// normal routes, with auth
app.get('/withauth', (req, res, next) => {
	res.status(200).json({ success: true, message: 'Should get it after login!' });
});

// start the REST API
app.listen(8081);
