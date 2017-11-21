# plcnode

[![NPM]( )]()

[![Travis branch](https://travis-ci.org/kevintage/plcnode.svg?branch=master)](https://travis-ci.org/kevintage/plcnode)

## Installation

> $ npm install --save

## Usage

```js
var Plcnode = require('plcnode');

// create a modbus client
var plcNode = new PlcNode(host, port, unitId, {sensorName1: address1[, sensorName2: address2[, ... [, sensorNameN: addressN]]]});

//start modbus
plcNode.start();

//stop modbus
plcNode.stop();

//read sensor data once
plcNode.readSensor(sensorNameN, callback(data));

//read sensor data at intervals
//adds the listener function to the end of the plcNode.on array for the event named 'dataInt',
//before call function plcNode.readSensorInt
plcNode.on('dataInt', callback(data));
plcNode.readSensorInt(sensorNameN, delay);

//cancels a Timeout object created by readSensorInt
plcNode.clear();
```

## License  

Licensed under [MIT](https://github.com/kevintage/plcnode/blob/master/LICENSE).
