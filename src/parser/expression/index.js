
import antlr4 from 'antlr4'
import Lexer from '../../antlr/expression/ExpressionLexer'
import Parser from '../../antlr/expression/ExpressionParser'
import Visitor from './visitor'

var ErrorListener = function(originExpr) {
  antlr4.error.ErrorListener.call(this)
  this.originExpr = originExpr

  return this
}

ErrorListener.prototype = Object.create(antlr4.error.ErrorListener.prototype)
ErrorListener.prototype.constructor = ErrorListener
ErrorListener.prototype.syntaxError = function(rec, sym, line, col, msg, e) {
  console.error('\n', this.originExpr, '\n', '(', line, ':', col, ')', msg)
}

function parse(input) {
  const chars = new antlr4.InputStream(input)
  const lexer = new Lexer.ExpressionLexer(chars)
  const tokens = new antlr4.CommonTokenStream(lexer)
  const parser = new Parser.ExpressionParser(tokens)

  parser.removeErrorListeners()
  parser.addErrorListener(new ErrorListener(input))
  parser.buildParseTrees = true

  return (new Visitor()).visitLine(parser.line())
}

export default {
  parse: parse
}
