// Language reference (does not always work):
// https://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/language-elements.html

// https://help.adobe.com/en_US/as3/learn/WS597e5dadb9cc1e02-6e28df0f130d240d5d7-8000.html
const PREC = {
  PRIMARY: 16, // [] {x:y} () f(x) new x.y x[y] <></> @ :: ..
  POSTFIX: 15, // x++ x--
  UNARY: 14, // ++x --x + - ~ ! delete typeof void
  MULTIPLICATIVE: 13, // * / %
  ADDITIVE: 12, // + -
  BITWISE_SHIFT: 11, // << >> >>>
  RELATIONAL: 10, // < > <= >= as in instanceof is
  EQUALITY: 9, // == != === !==
  BITWISE_AND: 8, // &
  BITWISE_XOR: 7, // ^
  BITWISE_OR: 6, // |
  LOGICAL_AND: 5, // &&
  LOGICAL_OR: 4, // ||
  CONDITIONAL: 3, // ?:
  ASSIGNEMENT: 2, // = *= /= %= += -= <<= >>= >>>= &= ^= |=
  COMMA: 1, // ,
};

module.exports = grammar({
  name: 'actionscript',

  extras: ($) => [$.line_comment, $.block_comment, /\s/],

  supertypes: ($) => [
    $.statement,
    $.declaration,
    $.expression,
    $.primary_expression,
  ],

  conflicts: ($) => [[$.class_attribut, $.property_attribut]],

  word: ($) => $.identifier,

  rules: {
    program: ($) => repeat($.statement),

    // Declarations

    declaration: ($) =>
      choice(
        $.variable_declaration,
        $.constant_declaration,
        $.function_declaration,
        $.class_declaration,
        $.interface_declaration,
        $.package_declaration
      ),

    package_declaration: ($) =>
      seq(
        'package',
        optional(field('name', $.dotted_identifier)),
        '{',
        field('body', repeat($.statement)),
        '}'
      ),

    class_declaration: ($) =>
      seq(
        repeat($.class_attribut),
        'class',
        field('name', $.identifier),
        optional(seq('extends', $._data_type)),
        optional(seq('implements', sep1($._data_type, ','))),
        '{',
        field('body', repeat($.statement)),
        '}'
      ),

    // https://help.adobe.com/fr_FR/as3/learn/WS5b3ccc516d4fbf351e63e3d118a9b90204-7f36.html
    class_attribut: ($) => choice('dynamic', 'final', 'internal', 'public'),

    interface_declaration: ($) =>
      seq(
        'interface',
        field('name', $.identifier),
        optional(seq('extends', sep1($._data_type, ','))),
        '{',
        field('body', repeat($.method_declaration)),
        '}'
      ),

    method_declaration: ($) =>
      seq(
        'function',
        field('name', $.identifier),
        '(',
        field('parameters', optional($.function_parameters)),
        ')',
        optional(field('return_type', $.type_hint)),
        ';'
      ),

    function_declaration: ($) =>
      seq(
        repeat($.property_attribut),
        'function',
        field('name', $.identifier),
        '(',
        field('parameters', optional($.function_parameters)),
        ')',
        optional(field('return_type', $.type_hint)),
        '{',
        field('body', repeat($.statement)),
        '}'
      ),

    function_parameters: ($) =>
      sep1(choice(seq($.identifier, optional($.type_hint)), $.rest), ','),

    variable_declaration: ($) =>
      seq(
        repeat($.property_attribut),
        'var',
        field('name', $.identifier),
        optional(field('type', $.type_hint)),
        optional(seq('=', field('value', $.expression))),
        ';'
      ),

    constant_declaration: ($) =>
      seq(
        repeat($.property_attribut),
        'const',
        field('name', $.identifier),
        optional(field('type', $.type_hint)),
        optional(seq('=', field('value', $.expression))),
        ';'
      ),

    // https://help.adobe.com/fr_FR/as3/learn/WS5b3ccc516d4fbf351e63e3d118a9b90204-7f36.html
    property_attribut: ($) =>
      choice('internal', 'private', 'protected', 'public', 'static'),

    rest: ($) => seq('...', $.identifier),

    // Statements

    import_statement: ($) => seq('import', $.dotted_identifier, ';'),

    // block
    // conditionnals
    // loops
    // errors
    // labels

    statement: ($) =>
      choice($.import_statement, $.declaration, $.expression_statement),

    expression_statement: ($) => seq($.expression, ';'),

    // Expressions

    // assignation
    // function call
    // arithmetics
    // instanciation

    expression: ($) =>
      choice(
        $.primary_expression,
        $.assignment_expression,
        $.augmented_assignment_expression,
        $.unary_expression,
        $.binary_expression,
        $.ternary_expression,
        $.update_expression,
        $.new_expression
      ),

    primary_expression: ($) =>
      choice(
        $.subscript_expression,
        $.member_expression,
        $.parenthesized_expression,
        $.identifier,
        $.true,
        $.false,
        $.undefined,
        $.null,
        $.number,
        $.string,
        $.object,
        $.array,
        $.anonymous_function,
        $.call_expression
      ),

    subscript_expression: ($) =>
      prec(
        PREC.PRIMARY,
        seq(
          field('object', choice($.expression)),
          '[',
          field('index', $.expression),
          ']'
        )
      ),

    member_expression: ($) =>
      prec(
        PREC.PRIMARY,
        seq(
          field('object', choice($.expression)),
          '.',
          field('property', $.identifier)
        )
      ),

    parenthesized_expression: ($) =>
      prec(PREC.PRIMARY, seq('(', $.expression, ')')),

    object: ($) => prec(PREC.PRIMARY, seq('{', sep1($.pair, ','), '}')),

    pair: ($) =>
      seq(
        field('key', choice($.identifier, $.string, $.number)),
        ':',
        field('value', $.expression)
      ),

    array: ($) => prec(PREC.PRIMARY, seq('[', sep1($.expression, ','), ']')),

    anonymous_function: ($) =>
      prec(
        PREC.PRIMARY,
        seq(
          'function',
          '(',
          field('parameters', optional($.function_parameters)),
          ')',
          optional(field('return_type', $.type_hint)),
          '{',
          field('body', repeat($.statement)),
          '}'
        )
      ),

    call_expression: ($) =>
      prec(
        PREC.PRIMARY,
        seq(
          field('function', $.expression),
          '(',
          field('parameters', optional(sep1($.expression, ','))),
          ')'
        )
      ),

    assignment_expression: ($) =>
      prec(
        PREC.ASSIGNEMENT,
        seq(
          field(
            'left',
            choice($.member_expression, $.subscript_expression, $.identifier)
          ),
          '=',
          field('right', $.expression)
        )
      ),

    augmented_assignment_expression: ($) =>
      prec(
        PREC.ASSIGNEMENT,
        seq(
          field(
            'left',
            choice($.member_expression, $.subscript_expression, $.identifier)
          ),
          field(
            'operator',
            choice(
              '*=',
              '/=',
              '%=',
              '+=',
              '-=',
              '<<=',
              '>>=',
              '>>>=',
              '&=',
              '^=',
              '|='
            )
          ),
          field('right', $.expression)
        )
      ),

    unary_expression: ($) =>
      prec(
        PREC.UNARY,
        seq(
          field(
            'operator',
            choice('+', '-', '~', '!', 'delete', 'typeof', 'void')
          ),
          field('argument', $.expression)
        )
      ),

    binary_expression: ($) =>
      choice(
        ...[
          ['*', PREC.MULTIPLICATIVE],
          ['/', PREC.MULTIPLICATIVE],
          ['%', PREC.MULTIPLICATIVE],
          ['+', PREC.ADDITIVE],
          ['-', PREC.ADDITIVE],
          ['<<', PREC.BITWISE_SHIFT],
          ['>>', PREC.BITWISE_SHIFT],
          ['>>>', PREC.BITWISE_SHIFT],
          ['<', PREC.RELATIONAL],
          ['>', PREC.RELATIONAL],
          ['<=', PREC.RELATIONAL],
          ['>=', PREC.RELATIONAL],
          ['as', PREC.RELATIONAL],
          ['in', PREC.RELATIONAL],
          ['instanceof', PREC.RELATIONAL],
          ['is', PREC.RELATIONAL],
          ['==', PREC.EQUALITY],
          ['!=', PREC.EQUALITY],
          ['===', PREC.EQUALITY],
          ['!==', PREC.EQUALITY],
          ['&', PREC.BITWISE_AND],
          ['^', PREC.BITWISE_XOR],
          ['|', PREC.BITWISE_OR],
          ['&&', PREC.LOGICAL_AND],
          ['||', PREC.LOGICAL_OR],
        ].map(([op, pre]) =>
          prec.left(pre, seq($.expression, op, $.expression))
        )
      ),

    ternary_expression: ($) =>
      prec.right(
        PREC.CONDITIONAL,
        seq(
          field('condition', $.expression),
          '?',
          field('iftrue', $.expression),
          ':',
          field('iffalse', $.expression)
        )
      ),

    update_expression: ($) =>
      choice(
        prec(
          PREC.POSTFIX,
          seq(
            field('argument', $.expression),
            field('operator', choice('++', '--'))
          )
        ),
        prec(
          PREC.UNARY,
          seq(
            field('operator', choice('++', '--')),
            field('argument', $.expression)
          )
        )
      ),
    new_expression: ($) => prec(PREC.PRIMARY, seq('new', $.call_expression)),

    // import statements
    // defining namespace name <aaa>;
    // using namespace use <aaa>;

    // Loops (continue)

    // for
    // for..in
    // for each..in
    // while
    // do..while

    // Conditionals

    // if..else
    // if..else if
    // switch (break, default)

    // Vectors & Arrays

    // Vector.<>

    // Errors

    // try..catch..finally (may be multiple catch)
    // throw

    // Data types

    _data_type: ($) =>
      choice($.any_type, $.dotted_identifier, $.generic_data_type),

    any_type: ($) => '*',

    generic_data_type: ($) =>
      seq(
        $.dotted_identifier,
        '.<',
        field('type_parameters', sep1($._data_type, ',')),
        '>'
      ),

    type_hint: ($) => seq(':', field('type', $._data_type)),

    // Primitive

    true: ($) => 'true',
    false: ($) => 'false',
    undefined: ($) => 'undefined',
    null: ($) => 'null',

    // Numeric literals
    // https://docstore.mik.ua/orelly/web2/action/ch04_03.htm

    number: ($) =>
      choice(
        $._nan,
        $._pInfinity,
        $._mInfinity,
        $._hex_literal,
        $._decimal_literal
      ),

    _hex_literal: ($) => seq(choice('0x', '0X'), /[0-9a-fA-F][0-9a-fA-F_]*/),
    // _hex_literal: ($) => seq(choice('0x', '0X'), sep1(/[0-9a-fA-F]+/, /_+/)),
    // TODO: Octal should be 0777 like numbers
    // _oct_literal: ($) => '',

    _integer_literal: ($) => /[0-9][0-9_]*/,
    _exponential_part: ($) =>
      seq(choice('e', 'E'), optional(choice('+', '-')), $._integer_literal),
    _decimal_literal: ($) =>
      prec.right(
        seq(
          $._integer_literal,
          optional(seq('.', $._integer_literal)),
          optional($._exponential_part)
        )
      ),

    // Numeric constants
    // https://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/package-detail.html
    _nan: ($) => 'NaN',
    _pInfinity: ($) => 'Infinity',
    _mInfinity: ($) => '-Infinity',

    // String literals

    // From tree-sitter-javascript string literal
    // https://github.com/tree-sitter/tree-sitter-javascript/blob/master/grammar.js
    string: ($) =>
      choice(
        seq(
          '"',
          repeat(
            choice($._unescaped_double_string_fragment, $._escape_sequence)
          ),
          '"'
        ),
        seq(
          "'",
          repeat(
            choice($._unescaped_single_string_fragment, $._escape_sequence)
          ),
          "'"
        )
      ),

    _unescaped_double_string_fragment: ($) =>
      token.immediate(prec(1, /[^"\\]+/)),

    _unescaped_single_string_fragment: ($) =>
      token.immediate(prec(1, /[^'\\]+/)),

    _escape_sequence: ($) =>
      token.immediate(
        seq(
          '\\',
          choice(
            /[^xu0-7]/,
            /[0-7]{1,3}/,
            /x[0-9a-fA-F]{2}/,
            /u[0-9a-fA-F]{4}/,
            /u{[0-9a-fA-F]+}/
          )
        )
      ),

    // Common

    dotted_identifier: ($) => seq($.identifier, repeat(seq('.', $.identifier))),
    identifier: ($) => /[\p{L}_$][\p{L}\p{Nd}_$]*/,

    // Comments

    comment: ($) => choice($.line_comment, $.block_comment),
    line_comment: ($) => token(seq('//', /[^\n]*/)),
    block_comment: ($) => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),
  },
});

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function caseInsensitive(keyword) {
  return new RegExp(
    keyword
      .split('')
      .map((letter) => `[${letter}${letter.toUpperCase()}]`)
      .join('')
  );
}
