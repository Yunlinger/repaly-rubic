// Generated from Expression.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by ExpressionParser.

function ExpressionVisitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

ExpressionVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
ExpressionVisitor.prototype.constructor = ExpressionVisitor;

// Visit a parse tree produced by ExpressionParser#line.
ExpressionVisitor.prototype.visitLine = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#identifier.
ExpressionVisitor.prototype.visitIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#parenExpr.
ExpressionVisitor.prototype.visitParenExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op2.
ExpressionVisitor.prototype.visitOp2 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op1.
ExpressionVisitor.prototype.visitOp1 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op4.
ExpressionVisitor.prototype.visitOp4 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op3.
ExpressionVisitor.prototype.visitOp3 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op6.
ExpressionVisitor.prototype.visitOp6 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op10.
ExpressionVisitor.prototype.visitOp10 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op5.
ExpressionVisitor.prototype.visitOp5 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op11.
ExpressionVisitor.prototype.visitOp11 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op8.
ExpressionVisitor.prototype.visitOp8 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op7.
ExpressionVisitor.prototype.visitOp7 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#op9.
ExpressionVisitor.prototype.visitOp9 = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by ExpressionParser#value.
ExpressionVisitor.prototype.visitValue = function(ctx) {
  return this.visitChildren(ctx);
};



exports.ExpressionVisitor = ExpressionVisitor;