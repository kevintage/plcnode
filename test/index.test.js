var chai = require('chai'),
    expect = chai.expect;

var PlcNode = require('../index');
var plcNode = new PlcNode('192.168.0.11', '502', 1);

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
        
        it('read pressure', function(done) {
            plcNode.readSensor('pressure', function (err, bar) {                  
                expect(_.isNumber(bar)).to.be.true;
                done();
            });  
        });
        
        it('read pump', function(done) {
            plcNode.readSensor('pump', function (err, lHr) {                  
                expect(_.isNumber(lHr)).to.be.true;
                done();
            });
        });
        
        it('read ph', function(done) {
            plcNode.readSensor('ph', function (err, val) {                  
                expect(_.isNumber(val)).to.be.true;
                done();
            });
        });
        
    });
});

describe('read sensor continually', function() {
    describe('#plcNode.readSensorConti', function() {
        it('should be a function', function() {
            expect(plcNode.readSensorConti).to.be.a('function');
        });
        
        it('read pressure continually', function(done) {
            plcNode.once('pressureConti', function (bar) { 
                expect(_.isNumber(bar)).to.be.true;
                done();
            });
            plcNode.readSensorConti('pressure');            
        });
 
        it('read pump continually', function(done) {
            plcNode.once('pumpConti', function (lHr) { 
                expect(_.isNumber(lHr)).to.be.true;
                done();
            });
            plcNode.readSensorConti('pump');
        });
        
        it('read ph continually', function(done) {
            plcNode.once('phConti', function (val) { 
                expect(_.isNumber(val)).to.be.true;
                done();
            });
            plcNode.readSensorConti('ph');
        });                

    });
});

describe('clear all', function() {
    describe('#plcNode.clear', function() {
        it('should be a function', function() {    
            expect(plcNode.clear).to.be.a('function');
        });
      
        it('clear pressure', function(done) {
            plcNode.clear();
            expect(_.isNull(plcNode.pressureConti._repeat)).to.be.true;
            done();
        });
 
        it('clear pump', function(done) {
            expect(_.isNull(plcNode.pumpConti._repeat)).to.be.true;
            done();
        });
       
        it('clear ph', function(done) {
            expect(_.isNull(plcNode.phConti._repeat)).to.be.true;
            done();
        });

    });
});
