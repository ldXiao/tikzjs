import { runWorker } from '../src/main'
import { TikzRoot } from '../src/parser/TikzRoot'

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    if (key === '_location') {
      return
    }
    if (key === '_children' && value.length === 0) {
      return
    }
    return value
  }
}

const factory = require('../src/parser/factory').default

test('simple_test_1', () => {
  const result = new factory.tikzRoot({}, [])
  console.log(result instanceof TikzRoot)
  expect(result)
})

test('simple_test', () => {
  const result = runWorker('\\tikz{}')
  console.log(JSON.stringify(result, getCircularReplacer(), 2))
  expect(result)
})
