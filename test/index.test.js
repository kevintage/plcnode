var chai = require('chai'),
    expect = chai.expect;

var PlcNode = require('../index');
var plcNode = new PlcNode('192.168.0.11', '502', 1, {"pressure": 6001, "pump": 6003, "ph": 6001});

var _ = require('busyman');

describe('modbus connection', function() {
    describe('#plcNode.start', function() {
        it('should be a function', function() {    
            expect(plcNode.start).to.be.a('function');
        });
        
        it('modbus start', function(done) {
            plcNode.start(done());            
        });        
    });
});

describe('read sensor', function() {
    describe('#plcNode.readSensor', function() {
        it('should be a function', function() {
            expect(plcNode.readSensor).to.be.a('function');
        });
        
        for (var keys in plcNode.sensorInfo) {
            it('read '+ keys, function(done) {
                plcNode.readSensor(keys, function (err, data) {                  
                    expect(_.isString(data)).to.be.true;
                    done();
                });  
            });
	    }
    });
});

describe('read sensor at intervals', function() {
    describe('#plcNode.readSensorInt', function() {
        it('should be a function', function() {
            expect(plcNode.readSensorInt).to.be.a('function');
        });
        for (var keys in plcNode.sensorInfo) {
            it('read '+ keys+' at interval', function(done) {
                plcNode.once('dataInt', function (data) {
                    expect(_.isString(data)).to.be.true;
                    done();
                });
                plcNode.readSensorInt(keys ,500);
            });
	    }
    });
});

describe('clear setinterval', function() {
    describe('#plcNode.clear', function() {
        it('should be a function', function() {    
            expect(plcNode.clear).to.be.a('function');
        });
        for (var keys in plcNode.sensorInfo) {      
            it('clear setinterval of read '+keys, function(done) {
                plcNode.clear();
                expect(_.isNull(plcNode.sensorInt[keys]._repeat)).to.be.true;
                done();
            });
	    }
    });
});
