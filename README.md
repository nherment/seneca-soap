

options
-------

    {
      server: yourServer, // (optional) http server instance
      port: 8004, // (optional) if server is not set, one will be started on this port

    }


Usage
-----

    seneca.act({

        role: 'soap',

        cmd: 'register',

        name: 'myService'

        mappings: {

          apiName1: {
            role: 'myRole',
            cmd : 'myCmd'
          },

          apiName2: {
            role: '...',
            cmd : '...'
          }

        },

        wsdl: fs.readFileSync('./yourWsdl.wsdl')

      }, function(err) {

        // registered

      }
    )
