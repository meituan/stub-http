#! /usr/bin/env node

var http = require('http'),
    debug = require('debug')('stub-http:index'),
    Mock = require('monkeyjs'),
    server, mount;

if (module.parent) {
    // unit test
    module.exports = function(mount) {
        return createServer(new Mock(mount));
    };
} else {
    // standalone
    var argv = require('optimist').argv,

    mount = argv._[0];
    if (!mount) {
        console.log('Usage ./stub-http [-p port] [-a address] <mock-data-dir>');
        process.exit(1);
    }
    server = createServer(new Mock(mount));

    var port = argv.p || 80;
    var address = argv.a || '0.0.0.0';
    console.log('Listen %s at port %d', address, port);
    server.listen(port, address);
}

function createServer(mock) {
    return http.createServer(function(req, res) {
        var chunks = [];
        req.on('data', function(chunk) {
            if (chunk) {
                chunks.push(chunk);
            }
        });
        req.on('end', function(chunk) {
            if (chunk) {
                chunks.push(chunk);
            }

            var status = 200, content, type = 'application/json';
            try {
                var request = Buffer.concat(chunks).toString();

                debug("Request data", request);
                var response = mock.get(request);
                debug("Mock data", response);

                if (!response) {
                    status = 404;
                }
                content = JSON.stringify(response);

            } catch (err) {
                content = err.stack;
                type = 'text/plain';

            } finally {
                res.writeHead(status, {
                    'Content-Length': Buffer.byteLength(content, 'utf8'),
                    'Content-Type': type,
                });
                res.end(content);
            }
        });
    });
}
