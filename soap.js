var pluginName = 'soap'

var soap   = require('soap')
var assert = require('assert')
var _      = require('underscore')

var DEFAULT_PORT = 8004

function soap(options) {

  var seneca = this

  var server = options.server
  var wsdlList = []

  seneca.add({role: pluginName, cmd: 'register'}, function(args, callback) {

    var serviceName = args.name

    assert.ok(_.isObject(args.mappings), 'mappings is a mandatory argument')
    assert.ok(_.isString(args.wsdl), 'wsdl is a mandatory argument')

    var wsdl = args.wsdl

    var service = {}
    service[serviceName] = {}

    var port = service[serviceName][serviceName + 'Port'] = {}

    for(var mappingName in args.mappings) {
      port[mappingName] = buildMapping(this, mappingName, args.mappings[mappingName])
    }

    soap.listen(server, '/'+serviceName, service, wsdl)

  })

  seneca.add({role: pluginName, cmd: 'init'}, function(args, callback) {

    if(!server) {
      server.listen(options.port || DEFAULT_PORT, function(err) {
        if(err) throw err
        seneca.log.info('soap API started on port ['+DEFAULT_PORT+']')
      })
    }

    for(var i = 0 ; i < wsdlList.length ; i++) {
      soap.listen(server, '/wsdl', myService, xml)
    }

  })

}

function buildMapping(seneca, name, senecaArgs) {
  return function(args, callback) {

    for(var attr in senecaArgs) {
      args[attr] = senecaArgs[attr]
    }

    seneca.act(args, function(err, result) {

      callback({error: err, result: result})

    })

  }
}


module.exports = soap
