'use strict';

var modbus = require('jsmodbus'),
    util = require('util'),
    EventEmitter = require('events');

function PlcNode(host, port, unitId, sensorInfo) {
    var self = this;

    for (var keys in sensorInfo) {  
        if (typeof(sensorInfo[keys]) !== 'number') {
            throw new TypeError('sensor address should be number');
        }
    }

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
        self.emit('error');
    });

//    this.client.connect();

//    this.modbusStatus = true;

    this.modbusStatus = false;

    this.sensorInfo = sensorInfo;

    this.sensorInt = {};

    EventEmitter.call(this);
}

util.inherits(PlcNode, EventEmitter);

PlcNode.prototype.start = function () {
    if (!this.modbusStatus) {
        this.client.connect();
        this.modbusStatus = true;
    }
};

PlcNode.prototype.stop = function () {
    this.clear();
    this.client.close();
    this.modbusStatus = false;
};

PlcNode.prototype.readSensor = function (sensor, callback) {
    var address = this.sensorInfo[sensor],
        value,value2;
        
    if (address == undefined) {
        throw new TypeError('There is no such name in the sensorInfo list');
    }

    if (this.modbusStatus == false) {
       return ;  
    }
    
    this.client.readHoldingRegisters(address, 2).then(function (resp) {
        value = resp.register[0].toString(16);//+resp.register[1].toString(16);
        while (value.length !== 8) {
            value = value + '0';
        }
        
        value = new Buffer(value, 'hex');
        callback(null, JSON.stringify({"type": sensor, "value": value.readFloatBE(0)}));
    }, callback);
};

PlcNode.prototype.readSensorInt = function (sensor, interval) {
    var self = this,
        address = this.sensorInfo[sensor],
        value;

    if (address == undefined) {
        throw new TypeError('There is no such sensor name in the sensorInfo list');
    }
    
    if (this.modbusStatus == false) {
       return ;  
    }
          
    clearInterval(this.sensorInt[sensor]);    
    
    this.sensorInt[sensor] = setInterval(function () {
        self.client.readHoldingRegisters(address, 2).then(function (resp) {
            value = resp.register[0].toString(16);//+resp.register[1].toString(16);
            while (value.length !== 8) {
                value = value + '0';
            }
            
            value = new Buffer(value, 'hex');
            self.emit('dataInt', JSON.stringify({"type": sensor, "value": value.readFloatBE(0)}));
        }, self.emit);
    }, interval);
};
 
PlcNode.prototype.clear = function () {
    for (var keys in this.sensorInt) {
        clearInterval(this.sensorInt[keys]);
    }
};

module.exports = PlcNode;
