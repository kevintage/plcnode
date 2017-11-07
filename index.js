'use strict';

var modbus = require('jsmodbus'),
    EventEmitter = require('events'),
    util = require('util');

function PlcNode(host, port, unitId) {
    var self = this;
    this.client = modbus.client.tcp.complete({
        host: host,
        port: port,
        unitId: unitId,
        // 'logEnabled': true,
        // 'logLevel': 'debug'
    });

    this.client.on('connect', function () {
        self.emit('connect');
    });
    
    this.client.on('error', function () {
        self.emit('connect');
    });
    
    this.client.connect();
    
    this.pressureConti;
    this.pumpConti;
    this.phConti;
    this.modbusStatus = true;
    
    EventEmitter.call(this);
}

util.inherits(PlcNode, EventEmitter);

PlcNode.prototype.start = function () {
    if(!this.modbusStatus) {
        this.client.connect();
        this.modbusStatus = true;
    } else {
        return;
    }
};

PlcNode.prototype.stop = function () {
    this.clear();
    this.client.close();
    this.modbusStatus = false;
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
            this._readPh(function (err, val) {
                callback(null, val);
            });
            break;
        default:
            throw new TypeError('sensor should be pressure, pump, or ph!');
    }
};

PlcNode.prototype.readSensorConti = function (sensor) {
    var self = this;
    
    switch (sensor) {
        case 'pressure':
            clearInterval(self.pressureConti);
            self.pressureConti = setInterval(function () {
                self._readPressure(function (err, bar) {
                    self.emit('pressureConti', bar);
                });
            },1000);            
            break;
        case 'pump':
            clearInterval(self.pumpConti);
            self.pumpConti = setInterval(function () {
                self._readPump(function (err, lHr) {
                    self.emit('pumpConti', lHr);
                });
            },1000);
            break;
        case 'ph':
            clearInterval(self.phConti);
            self.phConti = setInterval(function () {
                self._readPh(function (err, val) {
                    self.emit('phConti', val);
                });
            },1000);
            break;
        default:
            throw new TypeError('sensor should be pressure, pump, or ph!');
    }
};
    
PlcNode.prototype.clear = function () {
    return clearInterval(this.pressureConti),
           clearInterval(this.pumpConti),
           clearInterval(this.phConti);
};

module.exports = PlcNode;
