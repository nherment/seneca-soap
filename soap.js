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

    expose('/' + serviceName, serviceName, service, wsdl)

    setImmediate(callback)

  })

  var delay = true
  var queue = []
  function expose(path, serviceName, service, wsdl) {
    if(delay) {
      queue.push({path: path, service: service, wsdl: wsdl})
    } else {
      var srv = soap.listen(server, '/' + serviceName, service, wsdl)
      srv.log = seneca.log.debug
    }
  }
  function processQueue() {

    while(queue.length > 0) {
      var serviceDef = queue.pop()

      var srv = soap.listen(server, serviceDef.path, serviceDef.service, serviceDef.wsdl)
      srv.log = seneca.log.debug

    }
  }

  seneca.add({init: pluginName}, function(args, callback) {

    if(!server) {
      server = http.createServer()
      server.listen(options.port || DEFAULT_PORT, function(err) {
        if(err) throw err
        delay = false
        processQueue()
        seneca.log.info('soap API started on port ['+DEFAULT_PORT+']')
      })
    }

    callback()

  })

  return {
    name: pluginName
  }

}

function prepareForSerialization(obj) {
  var serializable = {}
  if(obj) {
    for(var attr in obj) {
      if(obj.hasOwnProperty(attr))  {
        serializable[attr] = obj
      }
    }
  }
  return serializable
}

function buildMapping(seneca, name, senecaArgs) {

  return function(args, callback) {
    for(var attr in senecaArgs) {
      args[attr] = senecaArgs[attr]
    }

    seneca.act(args, function(err, result) {
      if(result) {
        // remove the junk because the sax parser will complain about serialized functions and attributes ending with '$'
        result = JSON.parse(JSON.stringify(result))
        for(var attr in result) {
          if(/\$$/.test(attr)) {
            delete result.id$
          }
        }
      }

      callback(err || result)

    })

  }
}
