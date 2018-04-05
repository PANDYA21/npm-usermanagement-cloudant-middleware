process.env.VCAP_SERVICES = JSON.stringify({
	cloudantNoSQLDB: [{
		credentials: require('./cloudant_creds')
	}]
});

const authorization_management = require('.');
const express = require('express');
const bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.json({
	limit: '1Gb'
}));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '1Gb'
}));
app.use(authorization_management(app));
// append application rutes herebelow.
app.get('/getit', (req, res, next) => {
	res.status(200).json({ success: true, message: 'Got it!' });
});

app.listen(8081);
