// Log object, for use with live demo
let log = [];

const clearLog = () => {
    log = [];
};

const addToLog = (str) => {
    log.push(str);
}

const getLog = () => {
    return log;
}

// Input Stream
function inputStream(input) {
    // Set position to beginning of file
    var pos = 0, line = 1, col = 0;
    // Return self as an object
    return {
        next  : next,
        peek  : peek,
        eof   : eof,
        croak : croak,  
    };
    // Consume next character
    function next() {
        // Get the next character in the file
        var char = input.charAt(pos++);
        // Determine if we're at the end of a line, and if so reset our column
        if (char === "\n") {
            line++;
            col = 0;
        } else {
            col++;
        }
        // Return the character for lexing
        return char;
    }
    // Peek at next character without consuming
    function peek() {
        return input.charAt(pos);
    }
    // Determine if we've read the end of the file
    function eof() {
        return peek() === "";
    }
    // Throw an error with a message
    function croak(err) {
        //throw new Error(`${err} (${line}:${col})`);
        addToLog(`> Error: ${err} (${line}:${col})`);
    }
}

// Lexer/Tokenizer

function tokenStream (input) {
    // Declare current token and list keywords
    var current = null;
    var keywords = " if else func true false while";
    // Return self as an object
    return {
        next  : next,
        peek  : peek,
        eof   : eof,
        croak : input.croak,
    };
    // Determine if current character is a keyword
    function is_keyword(x) {
        return keywords.indexOf(` ${x} `) >= 0;
    }
    // Determine if current character is a number/digit
    function is_digit(char) {
        return /[0-9]/i.test(char);
    }
    // Determine if current character begins an identifier
    function is_id_start(char) {
        return /[a-z_]/i.test(char);
    }
    // Determine if string is an identifier
    function is_id(char) {
        return is_id_start(char) || "?!-<>=0123456789".indexOf(char) >= 0;
    }
    // Determine if current character is an operator
    function is_op_char(char) {
        return "+-*/%=&|<>!".indexOf(char) >= 0;
    }
    // Determine if current character is a punctuation symbol
    function is_punc(char) {
        return ",;(){}[]".indexOf(char) >= 0;
    }
    // Determine if current character is a white space
    function is_whitespace(char) {
        return " \t\n".indexOf(char) >= 0;
    }
    // Read a string of characters to determine which belong to the current token
    function read_while(predicate) {
        var str = "";
        // Loop through through characters while new characters match the predicate function
        while (!input.eof() && predicate(input.peek())) {
            str += input.next();
        }
        // Return all characters belonging to the current token
        return str;
    }
    // Read a string as a number
    function read_number() {
        var has_dot = false;
        var number = read_while(function(char) {
            // Determine if there is a decimal in the number
            if (char === ".") {
                // If there a multiple decimals, stop reading
                if (has_dot) return false;
                has_dot = true;
                return true;
            }
            // If the next character is a digit, continue looping
            return is_digit(char);
        });
        // Return a number token
        return { type: "num", value: parseFloat(number) };
    }
    // Read a string as an identifier
    function read_ident() {
        // Get number of characters in identifier
        var id = read_while(is_id);
        // Determine the identifier type and return a token of that type
        return {
            type  : is_keyword(id) ? "kw" : "var",
            value : id,
        };
    }
    // Parse escapes in a string
    function read_escaped(end) {
        var escaped = false;
        var str = "";
        // Skip over opening parentheses
        input.next();
        // Loop until we reach the end character or the EOF
        while (!input.eof()) {
            var char = input.next();
            // Determine if the character is an escape (\) and escape it if so. Otherwise, add it to our string
            if (escaped) {
                str += char;
            } else if (char == "\\") {
                escaped = true;
            } else if (char == end) {
                break;
            } else {
                str += char;
            }
        }
        // Return the escaped string
        return str;
    }
    // Read a string of characters as a string value
    function read_string() {
        return { type: "str", value: read_escaped('"') };
    }
    // Skip over comment lines
    function skip_comment() {
        read_while(function(char) { 
            //console.log(char);
            //console.log(char !== "\n");
            return char !== "\n" 
        });
        // Skip over newline character
        input.next();
    }
    // Read the next character in the file
    function read_next() {
        // Skip any whitespace
        read_while(is_whitespace);
        // If we've reached the EOF stop lexing
        if (input.eof()) return null;
        // Get the next character in the file
        var char = input.peek();
        // Skip over comments
        if (char == "#") {
            skip_comment();
            return read_next();
        }
        // Tokenize a string if character is a quote
        if (char == '"') return read_string();
        // Tokenize a number if character is a digit
        if (is_digit(char)) return read_number();
        // Tokenize an identifier if character begins an identifier
        if (is_id_start(char)) return read_ident();
        // Tokenize punctuation if character is a punctuation symbol
        if (is_punc(char)) return {
            type  : "punc",
            value : input.next(),
        }
        // Tokenize an operator if the current character is an operator
        if (is_op_char(char)) return {
            type  : "op",
            value : read_while(is_op_char),
        }
        // If an unexpected character is found, throw an error
        input.croak(`Can't handle character ' ${char} '`);
    }
    // Look at the next parsed token without consuming
    function peek() {
        return current || (current = read_next());
    }
    // Consume the next parsed token in the file
    function next() {
        var tok = current;
        current = null;
        return tok || read_next();
    }
    // Determine if we've reached the end of the file
    function eof() {
        return peek() == null;
    }
}

// Parse to AST

// make a global FALSE token
var FALSE = { type: "bool", value: false };

function parse(input) {
    // Determine precedence of operators
    var PRECEDENCE = {
        "=": 1,
        "||": 2,
        "&&": 3,
        "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
        "+": 10, "-": 10,
        "*": 20, "/": 20, "%": 20,
    };
    // Parse tokens and return AST
    return parse_toplevel();
    // Determine if the current token is a punctuation symbol
    function is_punc(char) {
        var tok = input.peek();
        return tok && tok.type === "punc" && (!char || tok.value === char) && tok; 
    }
    // Determine if the current token is a keyword
    function is_kw(kw) {
        var tok = input.peek();
        return tok && tok.type === "kw" && (!kw || tok.value === kw) && tok; 
    }
    // Determine if the current token is an operator
    function is_op(op) {
        var tok = input.peek();
        return tok && tok.type === "op" && (!op || tok.value === op) && tok; 
    }
    // Skip the next token if it is punctuation, otherwise die
    function skip_punc(char) {
        if (is_punc(char)) {
            input.next();
        } else {
            input.croak(`Expected punctuation: "${char}"`);
        }
    }
    // Skip the next token if it is a keyword, otherwise die
    function skip_kw(kw) {
        if (is_kw(kw)) {
            input.next();
        } else {
            input.croak(`Expected keyword: "${kw}"`);
        }
    }
    // Skip the next token if it is an operator, otherwise die
    function skip_op(op) {
        if (is_op(op)) {
            input.next();
        } else {
            input.croak(`Expected operator: "${op}"`);
        }
    }
    // If an invalid token is passed, die
    function unexpected() {
        input.croak(`Unexpected token: ${JSON.stringify(input.peek())}`);
    }
    // Determine if an operator is a binary op
    function maybe_binary(left, my_prec) {
        // Get the current token
        var tok = is_op();
        if (tok) {
            // Determine precedence of operators
            var his_prec = PRECEDENCE[tok.value];
            if (his_prec > my_prec) {
                input.next();
                return maybe_binary({
                    type: tok.value === "=" ? "assign" : "binary",
                    operator: tok.value,
                    left: left,
                    right: maybe_binary(parse_atom(), his_prec),
                }, my_prec);
            }
        }
        return left;
    }
    // Delimit function tokens by parens and commas
    function delimited(start, stop, separator, parser) {
        var a = [];
        var first = true;
        // Skip opening paren
        skip_punc(start);
        // Loop until we hit the closing paren or the EOF
        while (!input.eof()) {
            // Stop if we hit the closing paren
            if (is_punc(stop)) break;
            // Skip comma tokens after first argument
            if (first) {
                first = false;
            } else {
                skip_punc(separator);
            }
            // Stop if we hit the closing paren
            if (is_punc(stop)) break;
            // Add argument to our argument list
            a.push(parser());
        }
        // Skip closing paren
        skip_punc(stop);
        // Return list of arguments
        return a;
    }
    // Parse function call
    function parse_call(func) {
        // Delimit function arguments and return function call
        return {
            type: "call",
            func: func,
            args: delimited("(", ")", ",", parse_expression),
        };
    }
    // Parse variable name
    function parse_varname() {
        // Get variable name from token
        var name = input.next();
        // If the current token is not a variable, die
        if (name.type !== "var") input.croak("Expecting variable name");
        // Return variable name
        return name.value;
    }
    // Parse conditional branch
    function parse_if() {
        // Skip the if keyword
        skip_kw("if");
        // Parse condition expression and "then" expression
        var cond = parse_expression();
        var then = parse_expression();
        // Create node for if statement
        var ret = {
            type: "if",
            cond: cond,
            then: then
        };
        // If the conditional has an else branch, parse it and add it to the node
        if (is_kw("else")) {
            input.next();
            ret.else = parse_expression();
        }
        // Return the node
        return ret;
    }
    // Parse function definition
    function parse_func() {
        // Determine if the function is being passed to a variable or is being given a name
        // Delimit arguments
        // Parse function body and return the function node
        return {
            type: "func",
            name: input.peek().type === "var" ? input.next().value : null,
            vars: delimited("(", ")", ",", parse_varname),
            body: parse_expression(),
        };
    }
    // Parse boolean value
    function parse_bool() {
        return {
            type: "bool",
            value: input.next().value === "true",
        };
    }
    // Determine if an expression is a function call
    function maybe_call(expr) {
        expr = expr();
        return is_punc("(") ? parse_call(expr) : expr;
    }
    // Parse a token
    function parse_atom() {
        // Determine if token is a function call
        return maybe_call(function() {
            // Parse expressions within parens
            if (is_punc("(")) {
                input.next();
                var exp = parse_expression();
                skip_punc(")");
                return exp;
            }
            // Parse {} blocks
            if (is_punc("{")) return parse_prog();
            // Parse conditional branches
            if (is_kw("if")) return parse_if();
            // Parse boolean values
            if (is_kw("true") || is_kw("false")) return parse_bool();
            // Parse function definitions
            if (is_kw("func")) {
                input.next();
                return parse_func();
            }
            // If none of the above, determine token type
            var tok = input.next();
            // If the token type is a variable, number or string, return it as a node
            if (tok.type == "var" || tok.type == "num" || tok.type == "str") {
                return tok;
            }
            // If an unexpected token is passed, die
            unexpected();
        });
    }
    // Parse all tokens
    function parse_toplevel() {
        var prog = [];
        // Loop through all tokens and parse them
        while (!input.eof()) {
            prog.push(parse_expression());
            // Skip semicolons
            if (!input.eof()) skip_punc(";");
        }
        // Return AST
        return { type: "prog", prog: prog };
    }
    // Parse {} block
    function parse_prog() {
        // Delimit expressions within block
        var prog = delimited("{", "}", ";", parse_expression);
        // If block has no expressions, return a FALSE node
        if (prog.length === 0) return FALSE;
        // If block has only one expression, return that expression
        if (prog.length === 1) return prog[0];
        // Return the parsed block
        return { type: "prog", prog: prog };
    }
    // Parse expression
    function parse_expression() {
        // Determine if expression is a function call
        return maybe_call(function() {
            // Determine if expression is a binary operator
            return maybe_binary(parse_atom(), 0);
        });
    }
}

// Environment object

function Environment(parent) {
    // Initialize environment variables and function defs
    this.vars = Object.create(parent ? parent.vars : null);
    // Inherit from parent if there is one
    this.parent = parent;
}

Environment.prototype = {
    // Extend the environment to a new closure
    extend: function() {
        return new Environment(this);
    },
    // Check within all closures for a variable
    lookup: function(name) {
        var scope = this;
        while (scope) {
            // If the variable exists in this closure, return this closure as the scope
            if (Object.prototype.hasOwnProperty.call(scope.vars, name)) {
                return scope;
            }
            // Otherwise, check the parent enclosure
            scope = scope.parent;
        }
    },
    // Get a variable or function
    get: function(name) {
        if (name in this.vars) return this.vars[name];
        //throw new Error(`Undefined variable ${name}`);
        addToLog(`> Error: Undefined variable ${name}`);
    },
    // Set the value of a variable
    set: function(name, value) {
        var scope = this.lookup(name);
        // If the variable doesn't exist, die
        if (!scope && this.parent) addToLog(`> Error: Undefined variable ${name}`); //throw new Error(`Undefined variable ${name}`);
        return (scope || this).vars[name] = value;
    }, 
    // Define a variable or function
    def: function(name, value) {
        return this.vars[name] = value;
    }
};

// Evaluate

function evaluate(exp, env, callback) {
    // Guard the stack!
    GUARD(evaluate, arguments);
    // Determine the expression type
    switch (exp.type) {
        // For number, string and bool values, return the value of the expression
        case "num":
        case "str":
        case "bool":
            callback(exp.value);
            return;
        // For a variable reference, get the value from the environment
        case "var":
            callback(env.get(exp.value));
            return;
        // For an assignment, evaluate the assignment expression, set the value in the environment
        case "assign":
            // If the left side of the assignment is not a variable, die
            if (exp.left.type != "var") {
                //throw new Error(`Cannot assign to ${JSON.stringify(exp.left)}`);
                addToLog(`> Error: Cannot assign to ${JSON.stringify(exp.left)}`);
            }
            // Evaluate the right side and set the value in the environment
            evaluate(exp.right, env, function cc(right) {
                GUARD(cc, arguments);
                callback(env.set(exp.left.value, right));
            });
            return;
        // For a binary operator, evaluate in the context of the expression and apply it to either side
        case "binary":
            evaluate(exp.left, env, function cc(left) {
                GUARD(cc, arguments);
                evaluate(exp.right, env, function cc(right) {
                    GUARD(cc, arguments);
                    callback(apply_op(exp.operator, left, right));
                });
            });
            return;
        // For a function definition, define that function within the environment
        case "func":
            callback(make_func(env, exp));
            return;
        // For a conditional, determine the condition and evaluate the appropriate "then" or "else" expression
        case "if":
            // Determine if the condition is true or false
            evaluate(exp.cond, env, function cc(cond) {
                GUARD(cc, arguments);
                // If true, evaluate the "then" expression
                if (cond !== false) evaluate(exp.then, env, callback);
                // If false and there is an "else" expression, evaluate it
                else if (exp.else) evaluate(exp.else, env, callback);
                // Otherwise continue to callback
                else callback(false);
            });
            return;
        // For a {} block, evaluate each expression within the block
        case "prog":
            // Loop through expressions
            (function loop(last, i) {
                GUARD(loop, arguments);
                // If there is another expression, evaluate it and continue iterating
                if (i < exp.prog.length) evaluate(exp.prog[i], env, function cc(val) {
                    GUARD(cc, arguments);
                    loop(val, i + 1);
                // Otherwise, break
                }); else {
                    callback(last);
                }
            })(false, 0);
            return;
        // For a function call, evaluate the function's body
        case "call":
            // Get the function from the expression
            evaluate(exp.func, env, function cc(func) {
                GUARD(cc, arguments);
                // Loop through arguments
                (function loop(args, i) {
                    GUARD(loop, arguments);
                    // If there is another argument, evaluate it and continue iterating
                    if (i < exp.args.length) evaluate(exp.args[i], env, function cc(arg) {
                        GUARD(cc, arguments);
                        args[i + 1] = arg;
                        loop(args, i + 1);
                    // Otherwise call function with found arguments
                    }); else {
                        func.apply(null, args);
                    }
                })([ callback ], 0);
            }); 
            return;
        // Handle edge cases by dying
        default:
            //throw new Error(`I don't know how to evaluate ${exp.type}`);
            addToLog(`> Error: Can't evaluate ${exp.type}`);
    }
}

// Apply operator

function apply_op(op, a, b) {
    // Determine if x is a number, or die
    function num(x) {
        if (typeof x != "number") {
            //throw new Error(`Expected number but got ${x}`);
            addToLog(`> Error: Expected number but got ${x}`);
        }
        return x;
    }
    // Prevent zero division
    function div(x) {
        if (num(x) === 0) {
            //throw new Error("Cannot divide by zero!");
            addToLog(`> Error: Can't divide by zero!`);
        }
    }
    // Determine operator type and apply
    switch (op) {
        case "+"  : return num(a) + num(b);
        case "-"  : return num(a) - num(b);
        case "*"  : return num(a) * num(b);
        case "/"  : return div(a) / div(b);
        case "%"  : return num(a) % num(b);
        case "&&" : return a !== false && b;
        case "||" : return a !== false ? a : b;
        case "<"  : return num(a) < num(b);
        case ">"  : return num(a) > num(b);
        case "<="  : return num(a) <= num(b);
        case ">="  : return num(a) >= num(b);
        case "=="  : return a === b;
        case "!="  : return a !== b;
    }
    // If operator is unknown, die
    throw new Error(`Can't apply operator '${op}'`);
}

// Create function definition

function make_func(env, exp) {
    // If function is named, define it by its name
    if (exp.name) {
        env = env.extend();
        env.def(exp.name, func);
    }
    function func(callback) {
        GUARD(func, arguments);
        // Get arguments and extend the environment to a new closure
        var names = exp.vars;
        var scope = env.extend();
        // Loop through arguments and define them in the environment
        for (var i = 0; i < names.length; ++i) {
            scope.def(names[i], i + 1 < arguments.length ? arguments[i + 1] : false);
        }
        // Evaluate the function body and add it to the environment
        evaluate(exp.body, scope, callback);
    }
    return func;
}

// Guard the stack with continuations as necessary
var stackLen;
function GUARD(f, args) {
    if (--stackLen < 0) throw new Continuation(f, args);
}
function Continuation(f, args) {
    this.f = f;
    this.args = args;
}

// Execute the program with stack guards in place
function Execute(f, args) {
    while (true) try {
        stackLen = 200;
        return f.apply(null, args);
    } catch(ex) {
        if (ex instanceof Continuation) f = ex.f, args = ex.args;
        else throw ex;
    }
}

// Set up the global environment and define built-in functions

var globalEnv = new Environment();

// print(str) - prints a string/number to the console
globalEnv.def("print", function(callback, str) {
    addToLog("> " + str);
    callback(false);
});

// Added for webapp version: Run from HTML form data
function RunFromForm (data) {
    // Parse to AST
    var ast = parse(tokenStream(inputStream(data)));

    clearLog();

    // Run the program
    Execute(evaluate, [ ast, globalEnv, function(result) {
        // Do something maybe?
    }]);
}

// Exports
export { getLog };
export default RunFromForm;