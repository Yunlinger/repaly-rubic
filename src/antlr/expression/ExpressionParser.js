// Generated from Expression.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');
var ExpressionListener = require('./ExpressionListener').ExpressionListener;
var ExpressionVisitor = require('./ExpressionVisitor').ExpressionVisitor;

var grammarFileName = "Expression.g4";


var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003\u001e8\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0003\u0002\u0003",
    "\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0005\u0003\u0013",
    "\n\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0007\u00033\n\u0003\f\u0003\u000e\u00036\u000b\u0003\u0003",
    "\u0003\u0002\u0003\u0004\u0004\u0002\u0004\u0002\u0007\u0003\u0002\u0005",
    "\u0006\u0003\u0002\b\n\u0003\u0002\u000b\f\u0003\u0002\r\u0010\u0003",
    "\u0002\u0011\u0012\u0002B\u0002\u0006\u0003\u0002\u0002\u0002\u0004",
    "\u0012\u0003\u0002\u0002\u0002\u0006\u0007\u0005\u0004\u0003\u0002\u0007",
    "\b\u0007\u0002\u0002\u0003\b\u0003\u0003\u0002\u0002\u0002\t\n\b\u0003",
    "\u0001\u0002\n\u000b\u0007\u0003\u0002\u0002\u000b\f\u0005\u0004\u0003",
    "\u0002\f\r\u0007\u0004\u0002\u0002\r\u0013\u0003\u0002\u0002\u0002\u000e",
    "\u0013\u0007\u001d\u0002\u0002\u000f\u0013\u0007\u0018\u0002\u0002\u0010",
    "\u0011\t\u0002\u0002\u0002\u0011\u0013\u0005\u0004\u0003\r\u0012\t\u0003",
    "\u0002\u0002\u0002\u0012\u000e\u0003\u0002\u0002\u0002\u0012\u000f\u0003",
    "\u0002\u0002\u0002\u0012\u0010\u0003\u0002\u0002\u0002\u00134\u0003",
    "\u0002\u0002\u0002\u0014\u0015\f\f\u0002\u0002\u0015\u0016\u0007\u0007",
    "\u0002\u0002\u00163\u0005\u0004\u0003\r\u0017\u0018\f\u000b\u0002\u0002",
    "\u0018\u0019\t\u0003\u0002\u0002\u00193\u0005\u0004\u0003\f\u001a\u001b",
    "\f\n\u0002\u0002\u001b\u001c\t\u0004\u0002\u0002\u001c3\u0005\u0004",
    "\u0003\u000b\u001d\u001e\f\t\u0002\u0002\u001e\u001f\t\u0005\u0002\u0002",
    "\u001f3\u0005\u0004\u0003\n !\f\b\u0002\u0002!\"\t\u0006\u0002\u0002",
    "\"3\u0005\u0004\u0003\t#$\f\u0007\u0002\u0002$%\u0007\u0013\u0002\u0002",
    "%3\u0005\u0004\u0003\b&\'\f\u0006\u0002\u0002\'(\u0007\u0014\u0002\u0002",
    "(3\u0005\u0004\u0003\u0007)*\f\u0005\u0002\u0002*+\u0007\u0015\u0002",
    "\u0002+3\u0005\u0004\u0003\u0006,-\f\u0004\u0002\u0002-.\u0007\u0016",
    "\u0002\u0002.3\u0005\u0004\u0003\u0005/0\f\u0003\u0002\u000201\u0007",
    "\u0017\u0002\u000213\u0005\u0004\u0003\u00042\u0014\u0003\u0002\u0002",
    "\u00022\u0017\u0003\u0002\u0002\u00022\u001a\u0003\u0002\u0002\u0002",
    "2\u001d\u0003\u0002\u0002\u00022 \u0003\u0002\u0002\u00022#\u0003\u0002",
    "\u0002\u00022&\u0003\u0002\u0002\u00022)\u0003\u0002\u0002\u00022,\u0003",
    "\u0002\u0002\u00022/\u0003\u0002\u0002\u000236\u0003\u0002\u0002\u0002",
    "42\u0003\u0002\u0002\u000245\u0003\u0002\u0002\u00025\u0005\u0003\u0002",
    "\u0002\u000264\u0003\u0002\u0002\u0002\u0005\u001224"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "'('", "')'", "'!'", "'~'", "'**'", "'*'", "'/'", 
                     "'%'", "'+'", "'-'", "'<'", "'<='", "'>'", "'>='", 
                     "'=='", "'!='", "'&'", "'^'", "'|'", "'&&'", "'||'" ];

var symbolicNames = [ null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, "VALUE", "BOOL", "FLOAT", 
                      "INTEGER", "HEX", "ID", "WS" ];

var ruleNames =  [ "line", "expr" ];

function ExpressionParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

ExpressionParser.prototype = Object.create(antlr4.Parser.prototype);
ExpressionParser.prototype.constructor = ExpressionParser;

Object.defineProperty(ExpressionParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

ExpressionParser.EOF = antlr4.Token.EOF;
ExpressionParser.T__0 = 1;
ExpressionParser.T__1 = 2;
ExpressionParser.T__2 = 3;
ExpressionParser.T__3 = 4;
ExpressionParser.T__4 = 5;
ExpressionParser.T__5 = 6;
ExpressionParser.T__6 = 7;
ExpressionParser.T__7 = 8;
ExpressionParser.T__8 = 9;
ExpressionParser.T__9 = 10;
ExpressionParser.T__10 = 11;
ExpressionParser.T__11 = 12;
ExpressionParser.T__12 = 13;
ExpressionParser.T__13 = 14;
ExpressionParser.T__14 = 15;
ExpressionParser.T__15 = 16;
ExpressionParser.T__16 = 17;
ExpressionParser.T__17 = 18;
ExpressionParser.T__18 = 19;
ExpressionParser.T__19 = 20;
ExpressionParser.T__20 = 21;
ExpressionParser.VALUE = 22;
ExpressionParser.BOOL = 23;
ExpressionParser.FLOAT = 24;
ExpressionParser.INTEGER = 25;
ExpressionParser.HEX = 26;
ExpressionParser.ID = 27;
ExpressionParser.WS = 28;

ExpressionParser.RULE_line = 0;
ExpressionParser.RULE_expr = 1;


function LineContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = ExpressionParser.RULE_line;
    this.e = null; // ExprContext
    return this;
}

LineContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LineContext.prototype.constructor = LineContext;

LineContext.prototype.EOF = function() {
    return this.getToken(ExpressionParser.EOF, 0);
};

LineContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};

LineContext.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterLine(this);
	}
};

LineContext.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitLine(this);
	}
};

LineContext.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitLine(this);
    } else {
        return visitor.visitChildren(this);
    }
};




ExpressionParser.LineContext = LineContext;

ExpressionParser.prototype.line = function() {

    var localctx = new LineContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, ExpressionParser.RULE_line);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 4;
        localctx.e = this.expr(0);
        this.state = 5;
        this.match(ExpressionParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function ExprContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = ExpressionParser.RULE_expr;
    return this;
}

ExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExprContext.prototype.constructor = ExprContext;


 
ExprContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};

function IdentifierContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

IdentifierContext.prototype = Object.create(ExprContext.prototype);
IdentifierContext.prototype.constructor = IdentifierContext;

ExpressionParser.IdentifierContext = IdentifierContext;

IdentifierContext.prototype.ID = function() {
    return this.getToken(ExpressionParser.ID, 0);
};
IdentifierContext.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterIdentifier(this);
	}
};

IdentifierContext.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitIdentifier(this);
	}
};

IdentifierContext.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitIdentifier(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function ParenExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    this.e = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ParenExprContext.prototype = Object.create(ExprContext.prototype);
ParenExprContext.prototype.constructor = ParenExprContext;

ExpressionParser.ParenExprContext = ParenExprContext;

ParenExprContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};
ParenExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterParenExpr(this);
	}
};

ParenExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitParenExpr(this);
	}
};

ParenExprContext.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitParenExpr(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op2Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op2Context.prototype = Object.create(ExprContext.prototype);
Op2Context.prototype.constructor = Op2Context;

ExpressionParser.Op2Context = Op2Context;

Op2Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op2Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp2(this);
	}
};

Op2Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp2(this);
	}
};

Op2Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp2(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op1Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.e = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op1Context.prototype = Object.create(ExprContext.prototype);
Op1Context.prototype.constructor = Op1Context;

ExpressionParser.Op1Context = Op1Context;

Op1Context.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};
Op1Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp1(this);
	}
};

Op1Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp1(this);
	}
};

Op1Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp1(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op4Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op4Context.prototype = Object.create(ExprContext.prototype);
Op4Context.prototype.constructor = Op4Context;

ExpressionParser.Op4Context = Op4Context;

Op4Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op4Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp4(this);
	}
};

Op4Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp4(this);
	}
};

Op4Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp4(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op3Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op3Context.prototype = Object.create(ExprContext.prototype);
Op3Context.prototype.constructor = Op3Context;

ExpressionParser.Op3Context = Op3Context;

Op3Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op3Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp3(this);
	}
};

Op3Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp3(this);
	}
};

Op3Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp3(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op6Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op6Context.prototype = Object.create(ExprContext.prototype);
Op6Context.prototype.constructor = Op6Context;

ExpressionParser.Op6Context = Op6Context;

Op6Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op6Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp6(this);
	}
};

Op6Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp6(this);
	}
};

Op6Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp6(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op10Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op10Context.prototype = Object.create(ExprContext.prototype);
Op10Context.prototype.constructor = Op10Context;

ExpressionParser.Op10Context = Op10Context;

Op10Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op10Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp10(this);
	}
};

Op10Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp10(this);
	}
};

Op10Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp10(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op5Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op5Context.prototype = Object.create(ExprContext.prototype);
Op5Context.prototype.constructor = Op5Context;

ExpressionParser.Op5Context = Op5Context;

Op5Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op5Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp5(this);
	}
};

Op5Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp5(this);
	}
};

Op5Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp5(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op11Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op11Context.prototype = Object.create(ExprContext.prototype);
Op11Context.prototype.constructor = Op11Context;

ExpressionParser.Op11Context = Op11Context;

Op11Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op11Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp11(this);
	}
};

Op11Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp11(this);
	}
};

Op11Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp11(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op8Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op8Context.prototype = Object.create(ExprContext.prototype);
Op8Context.prototype.constructor = Op8Context;

ExpressionParser.Op8Context = Op8Context;

Op8Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op8Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp8(this);
	}
};

Op8Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp8(this);
	}
};

Op8Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp8(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op7Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op7Context.prototype = Object.create(ExprContext.prototype);
Op7Context.prototype.constructor = Op7Context;

ExpressionParser.Op7Context = Op7Context;

Op7Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op7Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp7(this);
	}
};

Op7Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp7(this);
	}
};

Op7Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp7(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function Op9Context(parser, ctx) {
	ExprContext.call(this, parser);
    this.left = null; // ExprContext;
    this.right = null; // ExprContext;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

Op9Context.prototype = Object.create(ExprContext.prototype);
Op9Context.prototype.constructor = Op9Context;

ExpressionParser.Op9Context = Op9Context;

Op9Context.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};
Op9Context.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterOp9(this);
	}
};

Op9Context.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitOp9(this);
	}
};

Op9Context.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitOp9(this);
    } else {
        return visitor.visitChildren(this);
    }
};


function ValueContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ValueContext.prototype = Object.create(ExprContext.prototype);
ValueContext.prototype.constructor = ValueContext;

ExpressionParser.ValueContext = ValueContext;

ValueContext.prototype.VALUE = function() {
    return this.getToken(ExpressionParser.VALUE, 0);
};
ValueContext.prototype.enterRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.enterValue(this);
	}
};

ValueContext.prototype.exitRule = function(listener) {
    if(listener instanceof ExpressionListener ) {
        listener.exitValue(this);
	}
};

ValueContext.prototype.accept = function(visitor) {
    if ( visitor instanceof ExpressionVisitor ) {
        return visitor.visitValue(this);
    } else {
        return visitor.visitChildren(this);
    }
};



ExpressionParser.prototype.expr = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new ExprContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 2;
    this.enterRecursionRule(localctx, 2, ExpressionParser.RULE_expr, _p);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 16;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case ExpressionParser.T__0:
            localctx = new ParenExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;

            this.state = 8;
            this.match(ExpressionParser.T__0);
            this.state = 9;
            localctx.e = this.expr(0);
            this.state = 10;
            this.match(ExpressionParser.T__1);
            break;
        case ExpressionParser.ID:
            localctx = new IdentifierContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 12;
            this.match(ExpressionParser.ID);
            break;
        case ExpressionParser.VALUE:
            localctx = new ValueContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 13;
            this.match(ExpressionParser.VALUE);
            break;
        case ExpressionParser.T__2:
        case ExpressionParser.T__3:
            localctx = new Op1Context(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 14;
            _la = this._input.LA(1);
            if(!(_la===ExpressionParser.T__2 || _la===ExpressionParser.T__3)) {
            this._errHandler.recoverInline(this);
            }
            else {
            	this._errHandler.reportMatch(this);
                this.consume();
            }
            this.state = 15;
            localctx.e = this.expr(11);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 50;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,2,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                this.state = 48;
                this._errHandler.sync(this);
                var la_ = this._interp.adaptivePredict(this._input,1,this._ctx);
                switch(la_) {
                case 1:
                    localctx = new Op2Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 18;
                    if (!( this.precpred(this._ctx, 10))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
                    }
                    this.state = 19;
                    this.match(ExpressionParser.T__4);
                    this.state = 20;
                    localctx.right = this.expr(11);
                    break;

                case 2:
                    localctx = new Op3Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 21;
                    if (!( this.precpred(this._ctx, 9))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
                    }
                    this.state = 22;
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << ExpressionParser.T__5) | (1 << ExpressionParser.T__6) | (1 << ExpressionParser.T__7))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 23;
                    localctx.right = this.expr(10);
                    break;

                case 3:
                    localctx = new Op4Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 24;
                    if (!( this.precpred(this._ctx, 8))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
                    }
                    this.state = 25;
                    _la = this._input.LA(1);
                    if(!(_la===ExpressionParser.T__8 || _la===ExpressionParser.T__9)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 26;
                    localctx.right = this.expr(9);
                    break;

                case 4:
                    localctx = new Op5Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 27;
                    if (!( this.precpred(this._ctx, 7))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
                    }
                    this.state = 28;
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << ExpressionParser.T__10) | (1 << ExpressionParser.T__11) | (1 << ExpressionParser.T__12) | (1 << ExpressionParser.T__13))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 29;
                    localctx.right = this.expr(8);
                    break;

                case 5:
                    localctx = new Op6Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 30;
                    if (!( this.precpred(this._ctx, 6))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
                    }
                    this.state = 31;
                    _la = this._input.LA(1);
                    if(!(_la===ExpressionParser.T__14 || _la===ExpressionParser.T__15)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 32;
                    localctx.right = this.expr(7);
                    break;

                case 6:
                    localctx = new Op7Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 33;
                    if (!( this.precpred(this._ctx, 5))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
                    }
                    this.state = 34;
                    this.match(ExpressionParser.T__16);
                    this.state = 35;
                    localctx.right = this.expr(6);
                    break;

                case 7:
                    localctx = new Op8Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 36;
                    if (!( this.precpred(this._ctx, 4))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
                    }
                    this.state = 37;
                    this.match(ExpressionParser.T__17);
                    this.state = 38;
                    localctx.right = this.expr(5);
                    break;

                case 8:
                    localctx = new Op9Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 39;
                    if (!( this.precpred(this._ctx, 3))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
                    }
                    this.state = 40;
                    this.match(ExpressionParser.T__18);
                    this.state = 41;
                    localctx.right = this.expr(4);
                    break;

                case 9:
                    localctx = new Op10Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 42;
                    if (!( this.precpred(this._ctx, 2))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 2)");
                    }
                    this.state = 43;
                    this.match(ExpressionParser.T__19);
                    this.state = 44;
                    localctx.right = this.expr(3);
                    break;

                case 10:
                    localctx = new Op11Context(this, new ExprContext(this, _parentctx, _parentState));
                    localctx.left = _prevctx;
                    this.pushNewRecursionContext(localctx, _startState, ExpressionParser.RULE_expr);
                    this.state = 45;
                    if (!( this.precpred(this._ctx, 1))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 1)");
                    }
                    this.state = 46;
                    this.match(ExpressionParser.T__20);
                    this.state = 47;
                    localctx.right = this.expr(2);
                    break;

                } 
            }
            this.state = 52;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,2,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};


ExpressionParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 1:
			return this.expr_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

ExpressionParser.prototype.expr_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 10);
		case 1:
			return this.precpred(this._ctx, 9);
		case 2:
			return this.precpred(this._ctx, 8);
		case 3:
			return this.precpred(this._ctx, 7);
		case 4:
			return this.precpred(this._ctx, 6);
		case 5:
			return this.precpred(this._ctx, 5);
		case 6:
			return this.precpred(this._ctx, 4);
		case 7:
			return this.precpred(this._ctx, 3);
		case 8:
			return this.precpred(this._ctx, 2);
		case 9:
			return this.precpred(this._ctx, 1);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.ExpressionParser = ExpressionParser;
