const express = require('express');
const cookieParser = require('cookie-parser')
const _ = require('lodash');
const usermanagement = require('./callbackify');
const cookieMaxAge = 1000 * 36000; //1 hour

class UsermanagementRouter {
	constructor() {
		this.routes = {
			login_path: '/login',
			login_page: 'login.html',
			logout_path: '/logout',
			createuser_path: '/users/createuser',
			createuser_page: 'createuser.html',
			users_path: '/users/',
			authenticate_path: '/authenticate',
			base_path: arguments[0].base_path || '/',
			users_active_path: '/users/active',
			users_username_path: '/users/user/:username',
		};
		this.cookieMaxAge = arguments[0].cookieMaxAge || 1000 * 36000; //1 hour
		this.parentRouter = arguments[0].parentRouter;
		this.index = arguments[0].index || this.routes.base_path;
		this.sharedSecret = arguments[0].sharedSecret || 'koelnerDom';
		this.pathsWithoutAuth = arguments[0].pathsWithoutAuth; // should be an array of strings, requires parentRouter.
		this.router = express.Router();
		this.cookieParser();
		this.loginRouter();
		this.logoutRouter();
		this.userCreationRouter();
		this.authenticationRouter();
		this.authorizationRouter();
		this.usermanagementRouter();
		this.errHandler();
	}

	parseCreds(req) {
		let parsed_creds = undefined;
		try {
			parsed_creds = JSON.parse(req.cookies.authorization);
			parsed_creds.password = Buffer.from(parsed_creds.password, 'base64').toString();
		} catch (e) {

		}
		return parsed_creds;
	}

	cookieParser() {
		this.router.use(cookieParser());
	}

	loginRouter() {
		this.router.get(this.routes.login_path, (req, res, next) => {
			if (typeof this.parentRouter === 'undefined') {
				return res.status(200).sendFile(this.routes.login_page, { root: __dirname });
			}
			let parent_paths = _.map(this.parentRouter._router.stack, 'route.path');
			let user_provided_login_route = this.parentRouter._router.stack[_.findIndex(parent_paths, x => x === this.routes.login_path)];
			if (typeof user_provided_login_route === 'undefined') {
				return res.status(200).sendFile(this.routes.login_page, { root: __dirname });
			}
			return user_provided_login_route.handle(req, res, next);
		});
	}

	logoutRouter() {
		this.router.get(this.routes.logout_path, (req, res, next) => {
			return res.cookie('authorization', '').end();
		});
	}

	userCreationRouter() {
		this.router.get(this.routes.createuser_page, (req, res, next) => {
			return res.status(200).sendFile(this.routes.createuser_page, { root: __dirname });
		});

		this.router.post(this.routes.users_path, (req, res, next) => {
			if (req.body.sharedSecret !== this.sharedSecret) {
				return next(new Error('Incorrect secret.'));
			}
			usermanagement.createUserCb(req.body, (err, result) => {
				if (err) {
					return next(err);
				}
				res.status(200).redirect(this.routes.login_path + '?registrationSuccessful=true');
			});
		});
	}

	authenticationRouter() {
		this.router.post(this.routes.authenticate_path, (req, res, next) => {
			usermanagement.authenticateUserCb(req.body.username, Buffer.from(req.body.password, 'base64').toString(), (err, result) => {
				if (err) {
					return res.status(401).redirect(this.routes.login_path + '?authsuccess=false');
				}
				res.cookie('authorization', JSON.stringify({
					username: req.body.username,
					password: req.body.password
				}), {
					maxAge: cookieMaxAge,
					path: '/'
				});
				res.status(200).redirect(this.index);
			});
		});
	}

	authorizationRouter() {
		this.router.use(this.routes.base_path, (req, res, next) => {
			let parsed_creds = this.parseCreds(req);
			if (typeof parsed_creds === 'undefined') {
				return res.status(401).redirect(this.routes.login_path + '?authsuccess=false');
			}
			usermanagement.authenticateUserCb(parsed_creds.username, parsed_creds.password, (err, result) => {
				if (err) {
					return res.status(401).redirect(this.routes.login_path + '?authsuccess=false');
				}
				next();
			});
		});
	}

	usermanagementRouter() {
		this.router.get(this.routes.users_active_path, (req, res, next) => {
			usermanagement.getActiveUsersCb((err, result) => {
				err ? next(err) : res.status(200).json({ success: true, result });
			});
		});

		this.router.get(this.routes.users_username_path, (req, res, next) => {
			usermanagement.getUserCb(req.params.username, (err, result) => {
				err ? next(err) : res.status(200).json({ success: true, result });
			});
		});
	}

	// error handler
	errHandler() {
		this.router.use((err, req, res, next) => {
			res.status(500).json({ success: false, error: err.message || err.stack });
		});
	}

}

module.exports = UsermanagementRouter;
