process.env.VCAP_SERVICES = JSON.stringify({
	cloudantNoSQLDB: [{
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
let usermanagementRouter = new UsermanagementRouter({
	parentRouter: app,
	cookieMaxAge: 2 * 1000 * 3600
});
app.use(usermanagementRouter.router);
// append application rutes herebelow.
app.get('/getit', (req, res, next) => {
	res.status(200).json({ success: true, message: 'Got it!' });
});

app.listen(8081);
