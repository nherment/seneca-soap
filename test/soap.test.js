
var assert = require('assert')
var fs     = require('fs')

var seneca = require('seneca')()

seneca.use('../soap.js')

describe('soap', function() {

  this.timeout(10*1000)

  var callCount = 0
  seneca.add({role: 'soap-test', cmd: 'ping'}, function(args, callback) {
    callCount ++
    callback(undefined, {greeting: 'pong ' + args.name})
  })

  before(function(done) {
    seneca.ready(done)
  })

  it('register', function(done) {

    seneca.act({
      role: 'soap',
      cmd: 'register',
      name: 'TestModule',
      wsdl: fs.readFileSync(__dirname + '/soap.test.wsdl.xml').toString('utf8'),
      mappings: {
        ping: {
          role: 'soap-test',
          cmd: 'ping'
        }
      }
    }, function(err) {
      done(err)
    })

  })

  it('ping', function(done) {

    var soap = require('soap')
    var url = 'http://127.0.0.1:8004/TestModule?wsdl'
    var args = {name: Date.now() + ''}

    soap.createClient(url, function(err, client) {

      if(err) return done(err)

      client.ping(args, function(err, result) {
        if(err) return done(err)

        assert.ok(result)
        assert.equal(result.greeting, 'pong ' + args.name)
        done()
      })
    })

  })
})
