import { test, expect } from '@playwright/test'

test.describe('YunYan Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads the application', async ({ page }) => {
    await expect(page).toHaveTitle(/YunYan/)

    // Check if the main canvas container is present
    await expect(page.locator('#canvas-container')).toBeVisible()
  })

  test('creates a new card', async ({ page }) => {
    // Look for add card button or double-click to create card
    // This will depend on your actual UI implementation
    await page.dblclick('#canvas-container', { position: { x: 200, y: 200 } })

    // Verify card was created (adjust selector based on your implementation)
    await expect(page.locator('[data-testid="canvas-card"]')).toBeVisible()
  })

  test('selects a card with left click', async ({ page }) => {
    // Create a card first
    await page.dblclick('#canvas-container', { position: { x: 200, y: 200 } })

    // Left click to select
    await page.click('[data-testid="canvas-card"]')

    // Verify card is selected (check for selection indicator)
    await expect(page.locator('[data-testid="canvas-card"].selected')).toBeVisible()
  })

  test('creates connection with right click', async ({ page }) => {
    // Create two cards
    await page.dblclick('#canvas-container', { position: { x: 200, y: 200 } })
    await page.dblclick('#canvas-container', { position: { x: 400, y: 200 } })

    const cards = page.locator('[data-testid="canvas-card"]')

    // Select first card
    await cards.first().click()

    // Right click on second card to create connection
    await cards.last().click({ button: 'right' })

    // Verify connection was created
    await expect(page.locator('[data-testid="connection-line"]')).toBeVisible()
  })

  test('drags a card to new position', async ({ page }) => {
    // Create a card
    await page.dblclick('#canvas-container', { position: { x: 200, y: 200 } })

    const card = page.locator('[data-testid="canvas-card"]')

    // Drag the card to a new position
    await card.dragTo(page.locator('#canvas-container'), {
      targetPosition: { x: 300, y: 300 },
    })

    // Verify card moved (this would require checking the card's position)
    // Implementation depends on how you expose position data
  })

  test('handles keyboard shortcuts', async ({ page }) => {
    // Create a card
    await page.dblclick('#canvas-container', { position: { x: 200, y: 200 } })

    // Test Ctrl+Z (undo) - will be implemented in next step
    await page.keyboard.press('Control+z')

    // Test Ctrl+Y (redo) - will be implemented in next step
    await page.keyboard.press('Control+y')

    // Test Delete key
    await page.click('[data-testid="canvas-card"]')
    await page.keyboard.press('Delete')
  })
})
