grammar Expression;

/** PARSER */
line: e = expr EOF;
expr:
	'(' e = expr ')'									# parenExpr
	| ID												# identifier
	| VALUE												# value
	| ('!' | '~') e = expr						# op1
	| left = expr '**' right = expr 					# op2
	| left = expr ('*' | '/' | '%') right = expr 		# op3
	| left = expr ('+' | '-') right = expr 				# op4
	| left = expr ('<' | '<=' | '>' | '>=') right = expr # op5
	| left = expr ('==' | '!=') right = expr 			# op6
	| left = expr '&' right = expr 						# op7
	| left = expr '^' right = expr 						# op8
	| left = expr '|' right = expr 						# op9
	| left = expr '&&' right = expr 					# op10
	| left = expr '||' right = expr 					# op11
	;

/** LEXER */

fragment DIGIT: [0-9];
fragment LETTER: [a-zA-Z];
fragment EXPONENT: ('e' | 'E') ('+' | '-')? DIGIT+;

VALUE: BOOL | FLOAT | INTEGER | HEX;
BOOL: 'true' | 'false';
FLOAT: ('-')? (DIGIT)+ '.' (DIGIT)* EXPONENT?;
INTEGER: '-'? (DIGIT)+;
HEX: '0x' (DIGIT | [a-fA-F])+;
ID: '`' (~'`')+ '`';

WS: [ \t\n\r]+ -> skip;
