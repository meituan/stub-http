var fs = require('fs'),
    path = require('path'),
    request = require('supertest'),
    mount = path.join(__dirname, 'fixtures'),
    app = require('../index')(mount);

describe('index', function() {
    it('should return mock data', function() {
        var fixture = fs.readFileSync(path.join(mount, 'deal/:id.POST.json'), 'utf8');
        fixture = JSON.parse(fixture);

        request(app)
            .post('/')
            .send({ uri: '/deal/1234', method: 'POST' })
            .expect(200)
            .end(function(err, res) {
                (err === null).should.be.true;
                res.body.should.eql(fixture);
            });
    });

    it('should handle mock data not found error', function() {
        request(app)
            .post('/')
            .send({ uri: '/shop/1234', method: 'GET' })
            .expect(404)
            .end(function(err, res) {
                (err === null).should.be.true;
                res.text.should.equal('null');
            });
    });

    it('should Content-Length return byte length', function() {
        var content = fs.readFileSync(path.join(mount, 'deal/:id.POST.json'), 'utf8');
        request(app)
            .post('/')
            .send({ uri: '/deal/1234', method: 'POST' })
            .expect(200)
            .expect('Content-Length', Buffer.byteLength(content, 'utf8'));
    });
});
