import { option } from 'yargs'
import { AstNode, AstLocation } from './TikzAST'
export class TikzRoot extends AstNode {
  _type: 'TikzRoot' = 'TikzRoot'
  constructor(location: AstLocation, children: AstNode[]) {
    super(location, children)
  }
}

export class TikzInline extends AstNode {
  _options: AstNode[]
  _contents: AstNode[]
  constructor(location: AstLocation, options: AstNode[], contents: AstNode[]) {
    super(location, [])
    this._type = this.constructor.name
    this._options = options
    this._contents = contents
  }
}

export class TikzPicture extends AstNode {
  _options: AstNode[]
  _contents: AstNode[]
  constructor(location: AstLocation, options: AstNode[], contents: AstNode[]) {
    super(location, [])
    this._type = this.constructor.name
    this._options = options
    this._contents = contents
  }
}

export class TikzLiteral extends AstNode {
  _literal: string | number
  constructor(location: AstLocation, literal: string | number) {
    super(location, [])
    this._type = this.constructor.name
    this._literal = literal
    console.log(`literal:${this._literal}`)
  }
}

export class TikzOption extends AstNode {
  _option_key: string
  _option_override: string
  constructor(location: AstLocation, option_key: string, option_override: string) {
    super(location, [])
    this._type = this.constructor.name
    this._option_key = option_key
    this._option_override = option_override
  }
}

export class TikzPathOperation extends AstNode {
  constructor(location: AstLocation) {
    super(location, [])
    this._type = this.constructor.name
  }
}

export class TikzPath extends AstNode {
  _start: string
  _option_list: TikzOption[]
  _operation_list: TikzPathOperation[]
  constructor(location: AstLocation, start: string, option_list: TikzOption[], operation_list: TikzPathOperation[]) {
    super(location, [])
    this._type = this.constructor.name
    this._start = start
    this._option_list = option_list
    this._operation_list = operation_list
  }
}

export class TikzCoordinate extends TikzPathOperation {
  _cs_type: string = 'canvas'
  _move_type: string = ''
  _offset_list: TikzCoordinateOffset[]
  constructor(location: AstLocation, offset_list: TikzCoordinateOffset[], move_type?: string, cs_type?: string) {
    super(location)
    this._type = this.constructor.name
    this._move_type = move_type ? move_type : ''
    this._cs_type = cs_type ? cs_type : 'canvas'
    this._offset_list = offset_list
  }
}

export class TikzCoordinateOffset extends AstNode {
  _unit?: string
  _offset: number
  constructor(location: AstLocation, offset: number, unit?: string) {
    super(location, [])
    this._type = this.constructor.name
    this._offset = offset
    this._unit = unit
  }
}

export class TikzLineOperation extends TikzPathOperation {
  _line_type: string
  constructor(location: AstLocation, line_type: string) {
    super(location)
    this._type = this.constructor.name
    this._line_type = line_type
  }
}
