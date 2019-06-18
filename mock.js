var http = require('http')
var mysql = require('mysql')
var express = require('express')
var validator = require('express-validator')
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser')
var serveStatic = require('serve-static')
var csrf = require('csurf')
var Promise = require('bluebird')
var basicAuth = require('basic-auth')

var logger = require('../../util/logger')
var requtil = require('../../util/requtil')
var jwtutil = require('../../util/jwtutil')
var pathutil = require('../../util/pathutil')
var urlutil = require('../../util/urlutil')
var lifecycle = require('../../util/lifecycle')

module.exports = function(options) {
  var log = logger.createLogger('auth-mock')
  var app = express()
  var server = Promise.promisifyAll(http.createServer(app))

  lifecycle.observe(function() {
    log.info('Waiting for client connections to end')
    return server.closeAsync()
      .catch(function() {
        // Okay
      })
  })
  //mysql user check
  var connection = function createConnect(){
    return mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'bluehawk@xx.com1',
      port: '3306',
      database: 'stf'
    })
  }; 
  //connection.connect();
 
  // BasicAuth Middleware
  var basicAuthMiddleware = function(req, res, next) {
    function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
      return res.send(401)
    }

    var user = basicAuth(req)

    if (!user || !user.name || !user.pass) {
      return unauthorized(res)
    }

    if (user.name === options.mock.basicAuth.username &&
        user.pass === options.mock.basicAuth.password) {
      return next()
    }
    else {
      return unauthorized(res)
    }
  }

  app.set('view engine', 'pug')
  app.set('views', pathutil.resource('auth/mock/views'))
  app.set('strict routing', true)
  app.set('case sensitive routing', true)

  app.use(cookieSession({
    name: options.ssid
  , keys: [options.secret]
  }))
  app.use(bodyParser.json())
  app.use(csrf())
  app.use(validator())
  app.use('/static/bower_components',
    serveStatic(pathutil.resource('bower_components')))
  app.use('/static/auth/mock', serveStatic(pathutil.resource('auth/mock')))

  app.use(function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken())
    next()
  })

  if (options.mock.useBasicAuth) {
    app.use(basicAuthMiddleware)
  }

  app.get('/', function(req, res) {
    res.redirect('/auth/mock/')
  })

  app.get('/auth/mock/', function(req, res) {
    res.render('index')
  })

  app.post('/auth/api/v1/mock', function(req, res) {
    var log = logger.createLogger('auth-mock')
    log.setLocalIdentifier(req.ip)
    switch (req.accepts(['json'])) {
      case 'json':
        requtil.validate(req, function() {
            req.checkBody('name').notEmpty()
            req.checkBody('email').isEmail()
          })
          .then(function() {
            log.info('Authenticated "%s"', req.body.email)
            var token = jwtutil.encode({
              payload: {
                email: req.body.email
              , name: req.body.name
              }
            , secret: options.secret
            , header: {
                exp: Date.now() + 24 * 3600
              }
            })
            var conn1 = connection();
            conn1.connect();
        		var  addSql = 'SELECT username,email,type from t_stf_user where username=? and email=? limit 1';
        		var  addSqlParams = [req.body.name,req.body.email];
        		//check user and password
        		conn1.query(addSql,addSqlParams,function (err, result) {
        		        if(err){
        			         console.log('[INSERT ERROR] - ',err.message);
        			         res.status(400).json({
        			                success: false, 
        			                error: 'ValidationError',
        			                validationErrors: err.errors
        			              })
        			         return;
        		        }
        		        if(result.length == 0){
        				   console.log('user or password error');
        			         res.status(400).json({
        			                success: false, 
        			                error: 'ValidationError',
        			                validationErrors: 'user or password error'
        		              })
        		        	return;
        		        }
                   req.session.uinfo = JSON.stringify(result[0]);
                   var conn2 = connection();
                   conn2.query('SELECT serial from t_stf_user_devices where username=?',[req.body.name],function (err, result) {
                    if(err){
                      req.session.devices=JSON.stringify([])
                    }else{
                      serials = []
                      for(i in result){
                        serials.push(result[i].serial)
                      }
                      req.session.devices=JSON.stringify(serials)
                    }
                    res.status(200).json({
                      success: true,
                      redirect: urlutil.addParams(options.appUrl, {
                        jwt: token
                      })
                    })
                   });
                   conn2.end();
        		});
        		conn1.end();
            //res.status(200)
            //  .json({
            //    success: true
            //  , redirect: urlutil.addParams(options.appUrl, {
            //      jwt: token
            //    })
            //  })
          })
          .catch(requtil.ValidationError, function(err) {
            res.status(400)
              .json({
                success: false
              , error: 'ValidationError'
              , validationErrors: err.errors
              })
          })
          .catch(function(err) {
            log.error('Unexpected error', err.stack)
            res.status(500)
              .json({
                success: false
              , error: 'ServerError'
              })
          })
        break
      default:
        res.send(406)
        break
    }
  })

  server.listen(options.port)
  log.info('Listening on port %d', options.port)
}
