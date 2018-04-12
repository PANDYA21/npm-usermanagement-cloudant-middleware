# NPM middleware for use with express - wrapper of [npm-usermanagement-cloudant](https://git.timetoact-group.com/BPA/npm-usermanagement-cloudant.git)
This repository serves as a middleware for basic usermanagement routing and authneitcation with nodejs-express apps.

## Features and Description
- Express based routing
- Authentication for all routes including `/` and excluding `/login` routes
- Default `login.html` page
- Deafult `createuser.html` page
- Custom `/login` and `/createuser` frontends can be supplied to override the defaults.

## Usage
Install module:
```bash
npm install git+https://git.timetoact-group.com/BPA/npm-usermanagement-cloudant-middleware.git --save
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
