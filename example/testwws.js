'use strict';

var PlcNode = require('../index.js');
var plcNode = new PlcNode('192.168.0.11', '502', 1);

var WebSocket = require('ws');
var ws = new WebSocket('ws://192.168.1.109:1880');

ws.on('open', function open() {
    plcNode.start(function (err) {
        if (!err) {
            console.log('ready');
        }
    });
});


plcNode.on ('pressureConti', function (bar) { 
    ws.send(JSON.stringify({"type": "pressure", "value": bar}));
});

plcNode.on ('pumpConti', function (lHr) { 
    ws.send(JSON.stringify({"type": "pump", "value": lHr}));
});
            
plcNode.on ('phConti', function (val) { 
    ws.send(JSON.stringify({"type": "ph", "value": val}));
});

ws.on('message', function incoming(data) {
    switch (data) {
        case 'pressure':
            plcNode.readSensor('pressure', function (err, bar) {
                ws.send(JSON.stringify({"type": "pressure", "value": bar}));
            });
            break;
        case 'pump':
            plcNode.readSensor('pump', function (err, lHr) {
                ws.send(JSON.stringify({"type": "pump", "value": lHr}));
            });
            break;
        case 'ph':
            plcNode.readSensor('ph', function (err, val) {
                ws.send(JSON.stringify({"type": "ph", "value": val}));
            });
            break; 
        case 'pressureConti':
            plcNode.readSensorConti('pressure');
            break;
        case 'pumpConti':
            plcNode.readSensorConti('pump');
            break;
        case 'phConti':
            plcNode.readSensorConti('ph');
            break;
        case 'clear':
            plcNode.clear();
            break;
        case 'start':
            plcNode.start(function (err) {
                if (!err) {
                    console.log('modbus start');
                }
            });
            break;
        case 'stop':
            plcNode.stop(function (err) {
                if (!err) {
                    console.log('modbus close');
                }
            });
            break;
        default:
            return ;
    }
});
