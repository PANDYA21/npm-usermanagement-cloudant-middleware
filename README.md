# NPM middleware for use with express - wrapper of [npm-usermanagement-cloudant](https://github.com/RAW21/npm-usermanagement-cloudant.git)
This repository serves as a middleware for basic usermanagement routing and authneitcation with nodejs-express apps. The authentication part is done with JWT.

## Features and Description
- Express based routing
- Authentication for all routes starting from and including base-path
- Default `login.html` page
- Deafult `createuser.html` page
- Custom `/login` and `/createuser` frontends can be supplied to override the defaults.

## Usage
Install module:
```bash
npm install git+https://github.com/RAW21/npm-usermanagement-cloudant-middleware.git --save
```

Require and use in your code:

Note:
- Order is important
  * Write all routes before using usermanagementRouter.router that are to be used without auth (e.g. public)
  * All the other routes should be written after using usermanagementRouter.router.

```javascript
const UsermanagementRouter = require('usermanagement-cloudant-middleware');
const express = require('express');

// create instance
let usermanagementRouter = new UsermanagementRouter({
  // See Options in README.md for more details
  parentRouter: app, // provide parent custom routes through root router app if any.
  cookieMaxAge: 1 * 1000 * 3600, // authorization cookie expiration age in ms, default 1 hour.
  index: '/' // path to index.html or root page after successful auth
});

/* Order is important! */

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
```


## Options
### Default Options
```javascript
new UsermanagementRouter({
  login_path: '/login',
  login_page: 'login.html',
  logout_path: '/logout',
  createuser_path: '/users/createuser',
  createuser_page: 'createuser.html',
  users_path: '/users/',
  authenticate_path: '/authenticate',
  base_path: '/',
  users_active_path: '/users/active',
  users_username_path: '/users/user/:username',
  cookieMaxAge: 1000 * 36000, //1 hour
  index: this.base_path,
  sharedSecret: 'koelnerDom' 
})
```

### base_path
Base path where authnetication router is applied to.

### index
Path to either `index.html` or the page which normally user lands to after successully logging in.

### authenticate_path
Path where the user credentials are `POST`ed to varify.

### login_path
The path from where the `login_page` will be redirected to. 

### login_page
Path of the login page as HTML.

### logout_path
The path which deletes authentication cookies in browser.

### users_path
Base path where usermanagement takes place. Default paths for `createuser_path`, `createuser_page`, `users_active_path` and `users_username_path` are defiend based on this path defeinition. For example, if `users_path` is set to `/myUsers`, then `users_active_path` will be set to `/myUsers/active`, if not provided explicitly in options otherwise.

### createuser_path
The path from where `createuser_page` is redirected to.

### createuser_page
Path of the create-user page as HTML.

### users_active_path
Path to retrieve active users from DB.

### users_username_path
Path to retrieve a specific user from DB. Checked against username (the unique `_id` in DB).

### cookieMaxAge
Maximum age for authorization cookie. Default is 1 hour.

### sharedSecret
Shared secret string, required to create a new user, as the `createuser_path` and `createuser_page` do not use authentication. To make completely open user registrations, the `sharedSecret` can be set to empty string.
