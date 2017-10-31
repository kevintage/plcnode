'use strict';

var modbus = require('jsmodbus'),
    EventEmitter = require('events'),
    util = require('util');

var pressureConti,
    pumpConti,
    phConti;

function PlcNode(host, port, unitId) {
    this.client = modbus.client.tcp.complete({
        host: host,
        port: port,
        unitId: unitId,
        // 'logEnabled': true,
        // 'logLevel': 'debug'
    });
    EventEmitter.call(this);
}

util.inherits(PlcNode, EventEmitter);

PlcNode.prototype.start = function (callback) {
    this.client.on('connect', function () {
        callback(null);
    });

    this.client.on('error', function (err) {
        callback(err);
    });
    
    this.client.connect();    
    console.log('modbus start');
};

PlcNode.prototype.stop = function (callback) {
    this.clear();
    this.client.close();
    console.log('modbus stop');
};

//Pressure 6001
PlcNode.prototype._readPressure = function (callback) {
    this.client.readHoldingRegisters(6001, 1).then(function (resp) {
        var pressure = resp.register[0].toString(16);

        while (pressure.length !== 8) {
            pressure = pressure + '0';
        }
        pressure = new Buffer(pressure, 'hex');
        callback(null, pressure.readFloatBE(0));
    }, callback);
};

//Pump 6003
PlcNode.prototype._readPump = function (callback) {
    this.client.readHoldingRegisters(6003, 1).then(function (resp) {
        var pump = resp.register[0].toString(16);

        while (pump.length !== 8) {
            pump = pump + '0';
        }
        pump = new Buffer(pump, 'hex');
        callback(null, pump.readFloatBE(0));
    }, callback);
};

//PH 6005
PlcNode.prototype._readPh = function (callback) {
    this.client.readHoldingRegisters(6005, 1).then(function (resp) {
        var ph = resp.register[0].toString(16);

        while (ph.length !== 8) {
            ph = ph + '0';
        }
        ph = new Buffer(ph, 'hex');
        callback(null, ph.readFloatBE(0));
    }, callback);
};

PlcNode.prototype.readSensor = function (sensor, callback) {
    switch (sensor) {
        case 'pressure':
            this._readPressure(function (err, bar) {
                callback(null, bar);
            });
            break;
        case 'pump':
            this._readPump(function (err, lHr) {
                callback(null, lHr);
            });
            break;
        case 'ph':
            this._readPh(function (err, value) {
                callback(null, value);
            });
            break;
        default:
            throw new TypeError('sensor should be pressre, pump, or ph!');
    }
};

PlcNode.prototype.readSensorConti = function (sensor) {
    var self = this;
    
    switch (sensor) {
        case 'pressure':
            clearInterval(pressureConti);
            pressureConti = setInterval(function () {
                self._readPressure(function (err, bar) {
                    self.emit('pressureConti', bar);
                });
            },1000);            
            break;
        case 'pump':
            clearInterval(pumpConti);
            pumpConti = setInterval(function () {
                self._readPump(function (err, lHr) {
                    self.emit('pumpConti', lHr);
                });
            },1000);
            break;
        case 'ph':
            clearInterval(phConti);
            phConti = setInterval(function () {
                self._readPh(function (err, lHr) {
                    self.emit('phConti', lHr);
                });
            },1000);
            break;
        default:
            throw new TypeError('sensor should be pressre, pump, or ph!');
    }
};
    
PlcNode.prototype.clear = function () {
    return clearInterval(pressureConti),
           clearInterval(pumpConti),
           clearInterval(phConti);
};

module.exports = PlcNode;
