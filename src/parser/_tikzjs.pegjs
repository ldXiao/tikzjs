{
  const ft = require('./factory').default
  function err_not_impl(s) {
    return `${s} is not implemented`
  }
}
/////////////////////// Global //////////////////////////
start
  = t:tikz { return new ft.tikzRoot(location(), [t]) }
  / p:tikzpicture { return new ft.tikzRoot(location(), [p]) }
  / cd:tikzcd { return new ft.tikzRoot(location(), [cd]) }

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
  = lbracket list:option_list rbracket { return list; }
  / ws { return []; }

option_list "option list" 
  = x:(option|.., comma|) comma? { return x; }

option "global option"
  = b:bool_option { return ft.tikzOption(location(), b); }// TODO add  override option
  // / ov: override_option


bool_option "global bool option" //TODO add more options
  = 'draw'

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

///////////////////////// TIKZ-CD ///////////////////////////

tikzcd
  = "\\begin{tikzcd}" opts:tikzcdopts ws rows:tikzcd_rows ws "\\end{tikzcd}"
    { return new ft.tikzCd(location(), opts, rows); }

tikzcdopts
  = lbracket list:tikzcd_option_list rbracket { return list; }
  / ws { return []; }

tikzcd_option_list
  = items:(tikzcd_option|.., comma|) { return items; }

tikzcd_option
  = "column sep" ws "=" ws val:tikzcd_dim { return { key: 'columnSep', val }; }
  / "row sep"    ws "=" ws val:tikzcd_dim { return { key: 'rowSep',    val }; }
  / key:[a-zA-Z ]+ "=" val:[^\],]+ { return { key: key.join('').trim(), val: val.join('').trim() }; }
  / name:[a-zA-Z ]+ { return { key: name.join('').trim(), val: true }; }

tikzcd_dim
  = n:number ws u:unit { return { value: n, unit: u }; }
  / n:number            { return { value: n, unit: 'pt' }; }
  / name:[a-z]+ { return name.join(''); }

tikzcd_rows
  = first:tikzcd_row rest:(ws "\\\\" ws "\n"? ws tikzcd_row)* (ws "\\\\")?
    { return [first, ...rest.map(function(r){ return r[5]; })]; }

tikzcd_row
  = first:tikzcd_cell rest:(ws "&" ws tikzcd_cell)*
    { return new ft.tikzCdRow(location(), [first, ...rest.map(function(r){ return r[3]; })]); }

tikzcd_cell
  = ws content:tikzcd_content ws arrows:tikzcd_arrow*
    { return new ft.tikzCdCell(location(), content, arrows); }

tikzcd_content
  = "{" content:tikzcd_braced_content* "}" { return content.join(''); }
  / content:tikzcd_bare_content { return content; }

tikzcd_braced_content
  = "{" inner:tikzcd_braced_content* "}" { return "{" + inner.join('') + "}"; }
  / ch:[^{}] { return ch; }

tikzcd_bare_content
  = chars:(!tikzcd_stopper .)* { return chars.map(function(c){ return c[1]; }).join('').trim(); }

tikzcd_stopper
  = ws "&"
  / ws "\\\\"
  / ws "\\arrow"
  / ws "\\end"

tikzcd_arrow
  = ws "\\arrow" ws "[" ws dir:tikzcd_dir opts:tikzcd_arrow_opts ws "]"
    { return new ft.tikzCdArrow(location(), dir, opts); }

tikzcd_dir
  = chars:[rludURDL]+ { return chars.join('').toLowerCase(); }

tikzcd_arrow_opts
  = items:(ws "," ws tikzcd_arrow_opt)* { return items.map(function(i){ return i[3]; }); }

tikzcd_arrow_opt
  = '"' text:tikzcd_label_content* '"' prime:"'"?
    { return { type: 'label', text: text.join(''), swap: prime === "'" }; }
  / key:tikzcd_opt_word+ { return { type: 'opt', key: key.join('').trim() }; }

tikzcd_label_content
  = "{" inner:tikzcd_label_content* "}" { return "{" + inner.join('') + "}"; }
  / ch:[^"{}] { return ch; }

tikzcd_opt_word
  = ch:(!("," / "]" / '"') .) { return ch[1]; }


////////////////// COORDINATE SPEC ///////////////////////////

path_coordinate
  = c:coordinate { return new ft.tikzCoordinate(location(), c.offset_list,'' ,c.cs_type); }
  / plus c:coordinate { return new ft.tikzCoordinate(location(), c.offset_list,'+' ,c.cs_type); }
  / plusplus c:coordinate { return new ft.tikzCoordinate(location(), c.offset_list,'++' ,c.cs_type); }

coordinate
  = coordinate_canvas 
  / coordinate_canvas_polar
  // TODO add coordinate_xyz etc

coordinate_canvas
  = lpar x:offset_expr comma y:offset_expr rpar  { return {'offset_list': [x, y], "cs_type": 'canvas'}; }
  / lpar 'canvas cs' colon 'x' eq x_:offset_expr comma 'y' eq y_:offset_expr rpar { return {'offset_list': [x_, y_], "cs_type": 'canvas'}; }

coordinate_canvas_polar
  = lpar angle:offset_expr colon radius:offset_expr rpar { return {'offset_list': [angle, radius], "cs_type": 'ploar'}; }
  / lpar 'canvas polar cs' colon 'angle' eq angle_:offset_expr comma 'radius' eq radius_:offset_expr rpar { return {'offset_list': [angle_, radius_], "cs_type": 'ploar'}; }

offset_expr
  = n:number ws u:unit ws { return new ft.tikzCoordinateOffset(location(), n, u); }
  / n:number { return new ft.tikzCoordinateOffset(location(), n); }


unit
  = "cm"
  / "mm"
  / "pt"
  / "ex"
  / "em"
  / "rm"
  / "deg"

//////////////////// PATH SPEC ////////////////////////
statement_list
  = list:(statement|.., ws|) { return list; }

statement
  = path_statement
  // \ foreach_statement

path_statement
  = h:path_head opt:tikzoption opr:operation_list semicolon { return new ft.tikzPath(location(), h, opt, opr); }

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
  = c:path_coordinate { return c; }
  / l:line_operation { return l; }
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
  = streight_line_operation { return new ft.tikzLineOperation(location(), '--'); }
  / hv_corner_operation { return new ft.tikzLineOperation(location(), '-|'); }
  / vh_corner_operation { return new ft.tikzLineOperation(location(), '|-'); }

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



