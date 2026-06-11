import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extends Vitest's expect with matchers from jest-dom
expect.extend(matchers)

// Automatically clean up after each test case
afterEach(() => {
    cleanup()
})

// Stub out scrollIntoView for JSDOM compatibility
if (typeof window !== 'undefined') {
    window.HTMLElement.prototype.scrollIntoView = () => {}
}
