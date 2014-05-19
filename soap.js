var pluginName = 'soap'

var soap   = require('soap')
var assert = require('assert')
var _      = require('underscore')
var http   = require('http')

var DEFAULT_PORT = 8004

module.exports = function(options) {

  options = options || {}

  var seneca = this

  var server = options.server

  seneca.add({role: pluginName, cmd: 'register'}, function(args, callback) {

    var serviceName = args.name

    assert.ok(_.isObject(args.mappings), 'mappings is a mandatory argument')
    assert.ok(_.isString(args.wsdl), 'wsdl is a mandatory argument')

    var wsdl = args.wsdl

    var service = {}
    service[serviceName] = {}

    var port = service[serviceName][serviceName] = {}

    for(var mappingName in args.mappings) {
      port[mappingName] = buildMapping(this, mappingName, args.mappings[mappingName])
    }

    seneca.log.info('exposing SOAP service [' + serviceName + '] with operations [' + Object.keys(port) + ']')

    var srv = soap.listen(server, '/' + serviceName, service, wsdl)

    srv.log = seneca.log.debug

    setImmediate(callback)

  })

  seneca.add({init: pluginName}, function(args, callback) {

    if(!server) {
      server = http.createServer()
      server.listen(options.port || DEFAULT_PORT, function(err) {
        if(err) throw err
        seneca.log.info('soap API started on port ['+DEFAULT_PORT+']')
      })
    }

    callback()

  })

  return {
    name: pluginName
  }

}

function buildMapping(seneca, name, senecaArgs) {

  return function(args, callback) {
    for(var attr in senecaArgs) {
      args[attr] = senecaArgs[attr]
    }

    seneca.act(args, function(err, result) {

      callback(err || result)

    })

  }
}

