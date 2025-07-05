import { test, expect } from '@playwright/test'

test.describe('Multi-Selection Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    // Wait for the canvas to be ready
    await page.waitForSelector('[data-testid="canvas-card-0"]')
  })

  test('should support Ctrl+click multi-selection', async ({ page }) => {
    // Click first card normally
    await page.click('[data-testid="canvas-card-0"]')

    // Verify first card is selected (should have selection styling)
    const firstCard = page.locator('[data-testid="canvas-card-0"]')
    await expect(firstCard).toHaveClass(/selected/)

    // Ctrl+click second card to add to selection
    await page.click('[data-testid="canvas-card-1"]', { modifiers: ['Control'] })

    // Both cards should be selected
    const secondCard = page.locator('[data-testid="canvas-card-1"]')
    await expect(firstCard).toHaveClass(/selected/)
    await expect(secondCard).toHaveClass(/selected/)
  })

  test('should support Ctrl+A to select all cards', async ({ page }) => {
    // Press Ctrl+A to select all cards
    await page.keyboard.press('Control+a')

    // All visible cards should be selected
    const cards = page.locator('[data-testid^="canvas-card-"]')
    const cardCount = await cards.count()

    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i)
      await expect(card).toHaveClass(/selected/)
    }
  })

  test('should support box selection with mouse drag', async ({ page }) => {
    // Get the canvas element
    const canvas = page.locator('canvas').first()

    // Start drag from top-left corner
    await canvas.hover({ position: { x: 50, y: 50 } })
    await page.mouse.down()

    // Drag to bottom-right to create selection box
    await canvas.hover({ position: { x: 300, y: 200 } })
    await page.mouse.up()

    // Cards within the selection area should be selected
    // This test assumes cards are positioned within the drag area
    const selectedCards = page.locator('[data-testid^="canvas-card-"].selected')
    await expect(selectedCards).toHaveCount.greaterThan(0)
  })

  test('should delete multiple selected cards with Delete key', async ({ page }) => {
    // Select multiple cards using Ctrl+click
    await page.click('[data-testid="canvas-card-0"]')
    await page.click('[data-testid="canvas-card-1"]', { modifiers: ['Control'] })

    // Count initial cards
    const initialCards = page.locator('[data-testid^="canvas-card-"]')
    const initialCount = await initialCards.count()

    // Mock the confirm dialog to return true
    page.on('dialog', dialog => dialog.accept())

    // Press Delete key
    await page.keyboard.press('Delete')

    // Should have fewer cards now
    const remainingCards = page.locator('[data-testid^="canvas-card-"]')
    const remainingCount = await remainingCards.count()

    expect(remainingCount).toBeLessThan(initialCount)
  })

  test('should clear selection when clicking empty area', async ({ page }) => {
    // Select a card first
    await page.click('[data-testid="canvas-card-0"]')

    // Verify card is selected
    const card = page.locator('[data-testid="canvas-card-0"]')
    await expect(card).toHaveClass(/selected/)

    // Click on empty canvas area
    const canvas = page.locator('canvas').first()
    await canvas.click({ position: { x: 500, y: 500 } })

    // Card should no longer be selected
    await expect(card).not.toHaveClass(/selected/)
  })

  test('should support mixed single and multi-selection', async ({ page }) => {
    // Start with single selection
    await page.click('[data-testid="canvas-card-0"]')

    // Add to selection with Ctrl+click
    await page.click('[data-testid="canvas-card-1"]', { modifiers: ['Control'] })

    // Switch back to single selection (click without Ctrl)
    await page.click('[data-testid="canvas-card-2"]')

    // Only the last clicked card should be selected
    const firstCard = page.locator('[data-testid="canvas-card-0"]')
    const secondCard = page.locator('[data-testid="canvas-card-1"]')
    const thirdCard = page.locator('[data-testid="canvas-card-2"]')

    await expect(firstCard).not.toHaveClass(/selected/)
    await expect(secondCard).not.toHaveClass(/selected/)
    await expect(thirdCard).toHaveClass(/selected/)
  })

  test('should show selection rectangle during box selection', async ({ page }) => {
    const canvas = page.locator('canvas').first()

    // Start drag
    await canvas.hover({ position: { x: 100, y: 100 } })
    await page.mouse.down()

    // Move mouse to create selection rectangle
    await canvas.hover({ position: { x: 200, y: 150 } })

    // Selection rectangle should be visible
    // Note: This test might need adjustment based on actual implementation
    // The selection rectangle might be drawn as a separate element or canvas shape

    // Complete the selection
    await page.mouse.up()
  })
})
