import { vi } from 'vitest'

const observers = new Set<MockIntersectionObserver>()

export class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  readonly scrollMargin: string = '10px'
  private readonly callback: IntersectionObserverCallback
  private readonly targets = new Set<Element>()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    observers.add(this)
  }

  observe = vi.fn((target: Element) => {
    this.targets.add(target)
  })

  unobserve = vi.fn((target: Element) => {
    this.targets.delete(target)
  })

  disconnect = vi.fn(() => {
    this.targets.clear()
    observers.delete(this)
  })

  takeRecords = vi.fn(() => [])

  hasTarget(target: Element) {
    return this.targets.has(target)
  }

  notify(target: Element, isIntersecting: boolean) {
    this.callback(
      [
        {
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: isIntersecting
            ? target.getBoundingClientRect()
            : DOMRectReadOnly.fromRect(),
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ],
      this,
    )
  }
}

export function mockIsIntersecting(target: Element, isIntersecting: boolean) {
  for (const observer of observers) {
    if (observer.hasTarget(target)) {
      observer.notify(target, isIntersecting)
    }
  }
}

export function resetMockIntersectionObservers() {
  observers.clear()
}
