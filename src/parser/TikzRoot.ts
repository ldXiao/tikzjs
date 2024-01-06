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
