'use strict';

var PlcNode = require('../index.js');
var plcNode = new PlcNode('192.168.0.11', '502', 1, {"pressure": 6001, "pump": 6003, "ph": 6005});

var WebSocket = require('ws');
var ws = new WebSocket('ws://192.168.1.117:1880');

plcNode.on('connect', function () {
    console.log('modbus start');
});

plcNode.on('dataInt', function (data) { 
    ws.send(data);
});

ws.on('open', function open() {
    console.log('ready');
});

ws.on('message', function incoming(req) {
    switch (true) {
        case JSON.parse(req).interval == -1:
            plcNode.readSensor(JSON.parse(req).type, function (err, data) {
                ws.send(data);
            });
            break; 
        case JSON.parse(req).interval > 0:
            plcNode.readSensorInt(JSON.parse(req).type, JSON.parse(req).interval);
            break;
        case JSON.parse(req).type == 'clear':
            plcNode.clear();
            break;
        case JSON.parse(req).type == 'start':
            plcNode.start();
            break;
        case JSON.parse(req).type == 'stop':
            plcNode.stop();
            console.log('modbus stop');
            break;
        default:
            return ;
    }
});
