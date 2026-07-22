import { parseBooleanQueryParam } from './query'

describe('parseBooleanQueryParam', () => {
  it.each([
    ['true', true],
    ['false', false],
    [undefined, undefined],
    ['', undefined],
    ['invalid', undefined],
  ])('should parse %j as %j', (value, expected) => {
    expect(parseBooleanQueryParam(value)).toBe(expected)
  })
})
