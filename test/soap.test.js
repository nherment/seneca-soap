
var assert = require('assert')

var seneca = require('seneca')()

seneca.use('../soap.js')

describe('soap', function() {

  seneca.add({role: 'soap-test', cmd: 'ping'}, function(args, callback) {
    callback(undefined, 'pong ' + args.name)
  })

  it('register', function(done) {

    seneca.act({
      role: 'soap',
      cmd: 'register',
      name: 'test',
      wsdl: fs.readFileSync('./soap.test.wsdl'),
      mappings: {
        ping: {
          role: 'soap-test',
          cmd: 'ping'
        }
      }
    })

  })
})
