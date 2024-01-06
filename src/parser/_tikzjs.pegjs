{
  const ft = require('./factory.ts').default
  function err_not_impl(s) {
    return `${s} is not implemented`
  }
}
/////////////////////// Global //////////////////////////
start 
  = t:tikz { return new ft.tikzRoot(location(), [t]) } 
  / p:tikzpicture { return new ft.tikzRoot(location(), [p]) }

tikz  
  = tikzhead opt:tikzoption lbrace cnt:tikzcontent rbrace { return new ft.tikzInline(location(), opt, cnt); }

tikzpicture 
  = tikzpicturehead opt:tikzoption cnt:tikzcontent tikzpicturetail { return new ft.tikzPicture(location(), opt, cnt); }

tikzhead 
  = ws ('\\tikz'/'\\tikzjs') ws 

tikzpicturehead 
  = begin lbrace ('tikzpicture'/'tikzjspicture') rbrace 

tikzpicturetail
  = end lbrace ('tikzpicture'/'tikzjspicture') rbrace

tikzoption 
  = lbracket list:option_list_gl rbracket { return list; }
  / ws { return []; }

option_list_gl "global option list" 
  = x:(option_gl|.., comma|) comma? { return x; }

option_gl "global option"
  = gbo:bool_option_gl { return gbo; }// TODO add global override option

bool_option_gl "global bool option" //TODO add more global options
 = opt:'option' { return new ft.tikzLiteral(location(), opt); } 

tikzcontent
  = ws list:statement_list ws { return list; }

begin_env
  = begin lbrace env_name rbrace

end_env
  = end lbrace env_name rbrace

env_name // envs other than tikzjspicture tikzpicture
  = "env_test"

begin
  = "\\begin"

end 
  = "\\end"


////////////////// COORDINATE SPEC ///////////////////////////

path_coordinate
  = ws (
    coordinate
  / plus coordinate 
  / plusplus coordinate
  ) ws

coordinate
  = coordinate_canvas / coordinate_canvas_polar // TODO add coordinate_xyz etc

coordinate_canvas
  = lpar x:offset_expr comma y:offset_expr rpar  
  / lpar 'canvas cs' colon 'x' eq x_:offset_expr comma 'y' eq y_:offset_expr rpar

coordinate_canvas_polar
  = lpar angle:number colon radius:offset_expr rpar
  / lpar 'canvas polar cs' colon 'angle' eq angle_:number comma 'radius'  eq radius_:offset_expr rpar

offset_expr
  = number/ number unit


unit = "cm"/ "mm" / "pt" / "ex"

//////////////////// PATH SPEC ////////////////////////
statement_list
  = list:(statement|.., ws|) { return list; }

statement
  = path_statement
  // \ foreach_statement

path_statement
  = path_head tikzoption operation_list semicolon

path_head 
  = '\\path'
  // / '\\draw'
  // / '\\fill'
  // / '\\filldraw'
  // / '\\pattern'
  // / '\\shade'
  // / '\\shadedraw'
  // / '\\clip'
  // //shor hand for node shapes
  // / '\\node'
  // / '\\matrix'

operation_list
  = list:(path_operation|.., ws|) { return list; }

path_operation
  = path_coordinate
  / line_operation
  // / curve_operation
  // / topath_operation
  // / node_operation
  // / rectangle_operation
  // / circle_operation
  // / ellipse_operation
  // / arc_operation
  // / grid_operation
  // / foreach_operation
  // / let_operation

line_operation
  = streight_line_operation
  / hv_corner_operation "horizontal_vertical corner"
  / vh_corner_operation "vertical_horizental corner"

streight_line_operation
  = ws '--' ws

hv_corner_operation
  = ws '-|' ws

vh_corner_operation 
  = ws '|-' ws

/////////////////// Primitives ////////////////////////

lpar = ws "(" ws

rpar = ws ")" ws

rbrace = ws '}' ws

lbrace = ws '{' ws

lbracket = ws '[' ws

rbracket =ws ']' ws

comma = ws ',' ws

colon = ws ':' ws

semicolon = ws ';' ws

eq = ws '=' ws

double_dots = ws '..' ws 

dot = ws '.' ws

tight_dot = '.'

plus = '+'

plusplus = '++'

ws "whitespace" = [ \t\n\r]*

in = ws 'in' ws 

at = ws 'at' ws

number
  = decimal_integer_literal tight_dot decimal_digit* {
      return parseFloat(text());
    }
  / tight_dot decimal_digit+ {
      return parseFloat(text());
    }
  / decimal_integer_literal {
      return  parseFloat(text());
    }

decimal_integer_literal
  = "0"
  / nonzero_digit decimal_digit*

decimal_digit
  = [0-9]

nonzero_digit
  = [1-9]



