import parser from '@/parser/expression'

describe('grammar:parse', () => {
  it('add', () => {
    expect(parser.parse('12.34+23.45')).toBe('12.34 + 23.45')
  })
  it('parenExpr', () => {
    expect(parser.parse('(1+2)*3')).toBe('(1 + 2) * 3')
  })
  it('neg', () => {
    expect(parser.parse('`AA`+-100')).toBe('`AA` + -100')
  })
  it('op1', () => {
    expect(parser.parse('!(true&&`id`)')).toBe('!(true && `id`)')
    expect(parser.parse('!(false||`id`)')).toBe('!(false || `id`)')
  })
  it('EXPONENT', () => {
    expect(parser.parse('12.34e10+23.45E3')).toBe('12.34e10 + 23.45E3')
  })
})
