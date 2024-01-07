import { AstNode } from '../parser/TikzAST'
export interface GeneratorInterface<DeriveNode extends AstNode> {
  render(n: DeriveNode): Node[]
}
