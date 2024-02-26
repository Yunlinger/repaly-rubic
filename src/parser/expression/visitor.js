import { ExpressionVisitor } from '../../antlr/expression/ExpressionVisitor'

class Visitor extends ExpressionVisitor {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super()
  }

  visitOperate2(ctx) {
    return this.visit(ctx.left) + ' ' + ctx.getChild(1).getText() + ' ' + this.visit(ctx.right)
  }

  visitLine(ctx) {
    return this.visit(ctx.e)
  }

  visitParenExpr(ctx) {
    return '(' + this.visit(ctx.e) + ')'
  }

  visitIdentifier(ctx) {
    return `this.getValue(${ctx.getText()})`
  }

  visitValue(ctx) {
    return ctx.getText()
  }

  visitOp1(ctx) {
    return ctx.getChild(0).getText() + this.visit(ctx.e)
  }

  visitOp2(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp3(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp4(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp5(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp6(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp7(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp8(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp9(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp10(ctx) {
    return this.visitOperate2(ctx)
  }

  visitOp11(ctx) {
    return this.visitOperate2(ctx)
  }
}

export default Visitor
