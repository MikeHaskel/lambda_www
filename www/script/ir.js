var Lambda = Lambda || {};
Lambda.IR = (function() {
    "use strict";

    function ExecutionState(codePtr, thisPtr) {
	this.saved = {
	    codePtr: codePtr,
	    thisPtr: thisPtr,
	    framePtr: undefined,
	    stackPtr: new Array
	}
	this.unsaved = {
	    running: true
	}
    }
    ExecutionState.prototype.step = function() {
	this.saved.codePtr.step(this);
    }
    ExecutionState.prototype.run = function() {
	while (this.unsaved.running) {
	    this.step();
	}
    }
    ExecutionState.prototype.push = function(val) {
	this.saved.stackPtr.push(val);
    }
    ExecutionState.prototype.pop = function() {
	return this.saved.stackPtr.pop();
    }
    ExecutionState.prototype.enter = function(codePtr, thisPtr) {
	this.saved = {
	    codePtr: codePtr,
	    thisPtr: thisPtr,
	    framePtr: this.saved,
	    stackPtr: new Array
	}
    }
    ExecutionState.prototype.leave = function() {
	this.saved = this.saved.framePtr;
    }
    ExecutionState.prototype.exit = function() {
	this.unsaved.running = false;
    }

    function Code() {}

    function ReturnCode() {}
    ReturnCode.prototype = Object.create(Code);
    ReturnCode.prototype.constructor = ReturnCode;
    ReturnCode.prototype.step = function(state) {
	var retval = state.pop();
	state.leave();
	state.push(retval);
    }

    return {
	ExecutionState: ExecutionState,
	
	Code: Code,
	ReturnCode: ReturnCode
    }
}).call();
