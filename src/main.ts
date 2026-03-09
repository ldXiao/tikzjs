import { parse } from './parser/_tikzjs'

export function runWorker(s: string): Object {
  return parse(s, {})
}

export { SvgGenerator } from './generators/SvgGenerator'
export type { SvgGeneratorOptions } from './generators/SvgGenerator'
