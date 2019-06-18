var _ = require('lodash')
var Promise = require('bluebird')

var mysql = require('mysql')

//mysql user check
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'bluehawk@xx.com1',
  port: '3306',
  database: 'stf'
}); 
//connection.connect();

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')

var log = logger.createLogger('api:controllers:devices')

module.exports = {
  getDevices: getDevices
, getDeviceBySerial: getDeviceBySerial
}

function getDevices(req, res) {
  var fields = req.swagger.params.fields.value
  var user = JSON.parse(req.session.uinfo)
  var _mydevices = JSON.parse(req.session.devices)
  log.info('user devices %s', req.session.devices)

  dbapi.loadDevices()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          var deviceList = []

          if(user && user.username && user.type){
            list.forEach(function(device) {
            datautil.normalize(device, req.user)
            var responseDevice = device

            if (fields) {
              responseDevice = _.pick(device, fields.split(','))
            }
            if(user.type==2 || _mydevices.indexOf(responseDevice.serial) > -1){
              deviceList.push(responseDevice)
            }
          })            
          }

          res.json({
            success: true
          , devices: deviceList
          ,d1:req.session.devices
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device list: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function getDeviceBySerial(req, res) {
  var serial = req.swagger.params.serial.value
  var fields = req.swagger.params.fields.value
  var user = JSON.parse(req.session.uinfo)
  var _mydevices = JSON.parse(req.session.devices)
  log.info('user devices %s', req.session.devices)

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      var responseDevice = device

      if (fields) {
        responseDevice = _.pick(device, fields.split(','))
      }
      if(user.type==2 || _mydevices.indexOf(responseDevice.serial) > -1){
        res.json({
        success: true
        , device: responseDevice
        })
      }

      
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}
