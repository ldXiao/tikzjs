export interface AstLocation {
  start?: {
    offset?: number
    line?: number
    column?: number
  }
  end?: {
    offset?: number
    line?: number
    column?: number
  }
}

interface AstLocatable {
  location(): AstLocation
  parent(): AstLocatable | undefined
  children(): AstLocatable[]
}

interface GeneratorInterface {
  render(n: AstNode): null
}

export class AstNode implements AstLocatable {
  _type: string
  _location: AstLocation
  _parent: AstNode | undefined
  _children: AstNode[]
  constructor(location: AstLocation, children: AstNode[]) {
    this._type = 'base'
    this._location = location
    this._parent = undefined
    this._children = children
    this._children.forEach((child) => {
      child._parent = this
    })
  }

  location() {
    return this._location
  }

  parent(): AstLocatable | undefined {
    return this._parent
  }

  children(): AstLocatable[] {
    return this._children
  }

  render<GeneratorType extends GeneratorInterface>(g: GeneratorType) {
    g.render(this)
  }
}
