function ExecutionFrame() {
    this.stack = new Array;
}
ExecutionFrame.prototype.push = function(value) {
    this.stack.push(value);
}
ExecutionFrame.prototype.pop = function() {
    return this.stack.pop();
}


function ChildExecutionFrame(parentFrame, returnPointer, varValue) {
    ExecutionFrame.call(this);

    this.parentFrame = parentFrame;
    this.returnPointer = returnPointer;
    this.varValue = varValue;
}
ChildExecutionFrame.prototype = new Object(ExecutionFrame.prototype);
ChildExecutionFrame.prototype.constructor = ChildExecutionFrame;

ChildExecutionFrame.prototype.getVar = function(depth) {
    var frame = this;
    
    while (depth > 0) {
	frame = frame.parentFrame;
	depth--;
    }

    return frame.varValue;
}


function ExecutionContext(code) {
    this.code = code;
    this.frame = new ExecutionFrame;
}
ExecutionContext.prototype.run = function() {
    while (this.code.step(this)) {}
    
    return this.frame.pop()
}


function Code() {}

function VarCode(n, nextCode) {
    this.n = n;
    this.nextCode = nextCode;
}
VarCode.prototype = new Object(Code.prototype);
VarCode.prototype.constructor = VarCode;
VarCode.prototype.step = function(ctx) {
    ctx.frame.push(ctx.frame.getVar(this.n))
    ctx.code = this.nextCode;

    return true;
}

function CallCode(funCode, nextCode) {
    this.funCode = funCode;
    this.nextCode = nextCode;
}
CallCode.prototype = new Object(Code.prototype);
CallCode.prototype.constructor = CallCode;
CallCode.prototype.step = function(ctx) {
    var arg = ctx.frame.pop();
    var newFrame = new ChildExecutionFrame(ctx.frame, nextCode, arg);

    ctx.frame = newFrame;
    ctx.code = this.funCode;

    return true;
}

function TailCallCode(funCode) {
    this.funCode = funCode;
}
TailCallCode.prototype = new Object(Code.prototype);
TailCallCode.prototype.constructor = TailCallCode;
TailCallCode.prototype.step = function(ctx) {
    var arg = ctx.frame.pop();

    ctx.frame.varValue = arg;
    ctx.code = this.funCode;

    return true;
}

function ReturnCode() {}
ReturnCode.prototype = new Object(Code.prototype);
ReturnCode.prototype.constructor = ReturnCode;
ReturnCode.prototype.step = function(ctx) {
    var retval = ctx.frame.pop();

    ctx.code = ctx.frame.returnPointer;
    ctx.frame = ctx.frame.parentFrame;
    ctx.frame.push(retval);

    return true;
}

function ExitCode() {}
ExitCode.prototype = new Object(Code.prototype);
ExitCode.prototype.contstructor = ExitCode;
ExitCode.prototype.step = function(ctx) {
    return false;
}
