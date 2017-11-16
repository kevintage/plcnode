var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai =require('sinon-chai');
    _ = require('busyman');
    
var PlcNode = require('../index');
var plcNode = new PlcNode('192.168.0.11', '502', 1, {"pressure": 6001, "pump": 6003, "ph": 6001});

chai.use(sinonChai);

describe('modbus connection', function() {
    describe('#plcNode.start', function() {
        it('smodbus start', function() {    
            var startStub = sinon.stub(plcNode.client, 'connect').callsFake(function () {
                plcNode.client.emit('connect');
            });

            plcNode.start();
            expect(plcNode.modbusStatus).to.be.true;
            startStub.restore();
        });

        it('smodbus start', function() {    
            var startStub = sinon.stub(plcNode.client, 'connect').callsFake(function () {
                plcNode.client.emit('connect');
            });

            plcNode.stop();
            expect(plcNode.modbusStatus).to.be.false;
            startStub.restore();
        }); 
    });
});


describe('read sensor', function() {
    before(function() {
        plcNode.start();
    });
    describe('#plcNode.readSensor', function() {
        for (var keys in plcNode.sensorInfo) {
            it('read '+ keys, function() {
                var readStub = sinon.stub(plcNode.client, 'readHoldingRegisters').callsFake(function () {
                    return {then: function (cb1, cb2) {
                        var resp = { "fc": 3, "byteCount": 4, "payload": "<Buffer 41 a1 d1 4d>", "register": [ 16801, 53581 ] };
                        cb1(resp);
                    }};
                });
                
                plcNode.readSensor(keys, function (err, data) {                  
                    readStub.restore();
                    expect(_.isString(data)).to.be.true;
                });
            });
        }
    });
});

describe('read sensor at intervals', function() {
    describe('#plcNode.readSensorInt', function() {
        for (var keys in plcNode.sensorInfo) {
            it('read '+ keys+' at interval', function() {
                var readIntStub = sinon.stub(plcNode.client, 'readHoldingRegisters').callsFake(function () {
                    return {then: function (cb1, cb2) {
                        var resp = { "fc": 3, "byteCount": 4, "payload": "<Buffer 41 a1 d1 4d>", "register": [ 16801, 53581 ] };
                        cb1(resp);
                    }};
                });
                
                plcNode.once('dataInt', function (data) {
                    expect(_.isString(data)).to.be.true;
                });
                plcNode.readSensorInt(keys ,1000);
                readIntStub.restore();
            });
        }
    });
});


describe('clear setInterval', function() {
    describe('#plcNode.clear', function() {        
        for (var keys in plcNode.sensorInfo) {
            it('clear setInterval of read '+keys, function() {
                plcNode.sensorInt[keys]._repeat = 1000;
                plcNode.clear();
                expect(_.isNull(plcNode.sensorInt[keys]._repeat)).to.be.true;
            });
        }
    });
});
