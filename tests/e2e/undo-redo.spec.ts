import { test, expect } from '@playwright/test'

test.describe('撤销/重做功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 等待应用加载完成
    await page.waitForSelector('[data-testid="canvas-stage"]', { timeout: 10000 })
  })

  test('应该能够撤销和重做卡片添加操作', async ({ page }) => {
    // 获取初始卡片数量
    const initialCards = await page.locator('[data-testid^="canvas-card-"]').count()

    // 双击画布添加新卡片
    await page.locator('[data-testid="canvas-stage"]').dblclick({
      position: { x: 400, y: 300 },
    })

    // 验证新卡片已添加
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 1)

    // 使用 Ctrl+Z 撤销
    await page.keyboard.press('Control+z')

    // 验证卡片已被撤销
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards)

    // 使用 Ctrl+Y 重做
    await page.keyboard.press('Control+y')

    // 验证卡片已被重做
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 1)
  })

  test('应该能够撤销和重做卡片删除操作', async ({ page }) => {
    // 获取初始卡片数量
    const initialCards = await page.locator('[data-testid^="canvas-card-"]').count()

    // 选择第一个卡片
    const firstCard = page.locator('[data-testid^="canvas-card-"]').first()
    await firstCard.click()

    // 删除卡片 (假设使用 Delete 键)
    await page.keyboard.press('Delete')

    // 验证卡片已删除
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards - 1)

    // 使用 Ctrl+Z 撤销删除
    await page.keyboard.press('Control+z')

    // 验证卡片已恢复
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards)

    // 使用 Ctrl+Y 重做删除
    await page.keyboard.press('Control+y')

    // 验证卡片再次被删除
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards - 1)
  })

  test('应该能够撤销和重做卡片移动操作', async ({ page }) => {
    // 选择第一个卡片
    const firstCard = page.locator('[data-testid^="canvas-card-"]').first()

    // 获取初始位置
    const initialBounds = await firstCard.boundingBox()
    expect(initialBounds).not.toBeNull()

    // 拖拽卡片到新位置
    await firstCard.dragTo(page.locator('[data-testid="canvas-stage"]'), {
      targetPosition: { x: initialBounds!.x + 100, y: initialBounds!.y + 100 },
    })

    // 验证卡片已移动
    const newBounds = await firstCard.boundingBox()
    expect(newBounds).not.toBeNull()
    expect(Math.abs(newBounds!.x - (initialBounds!.x + 100))).toBeLessThan(10)
    expect(Math.abs(newBounds!.y - (initialBounds!.y + 100))).toBeLessThan(10)

    // 使用 Ctrl+Z 撤销移动
    await page.keyboard.press('Control+z')

    // 验证卡片已恢复到初始位置
    const undoBounds = await firstCard.boundingBox()
    expect(undoBounds).not.toBeNull()
    expect(Math.abs(undoBounds!.x - initialBounds!.x)).toBeLessThan(10)
    expect(Math.abs(undoBounds!.y - initialBounds!.y)).toBeLessThan(10)

    // 使用 Ctrl+Y 重做移动
    await page.keyboard.press('Control+y')

    // 验证卡片再次移动到新位置
    const redoBounds = await firstCard.boundingBox()
    expect(redoBounds).not.toBeNull()
    expect(Math.abs(redoBounds!.x - (initialBounds!.x + 100))).toBeLessThan(10)
    expect(Math.abs(redoBounds!.y - (initialBounds!.y + 100))).toBeLessThan(10)
  })

  test('应该能够撤销和重做连接操作', async ({ page }) => {
    // 获取前两个卡片
    const cards = page.locator('[data-testid^="canvas-card-"]')
    const firstCard = cards.nth(0)
    const secondCard = cards.nth(1)

    // 选择第一个卡片
    await firstCard.click()

    // 右键点击第二个卡片创建连接
    await secondCard.click({ button: 'right' })

    // 验证连接已创建
    await expect(page.locator('[data-testid^="connection-line-"]')).toHaveCount(1)

    // 使用 Ctrl+Z 撤销连接
    await page.keyboard.press('Control+z')

    // 验证连接已被撤销
    await expect(page.locator('[data-testid^="connection-line-"]')).toHaveCount(0)

    // 使用 Ctrl+Y 重做连接
    await page.keyboard.press('Control+y')

    // 验证连接已被重做
    await expect(page.locator('[data-testid^="connection-line-"]')).toHaveCount(1)
  })

  test('应该支持 Ctrl+Shift+Z 作为重做快捷键', async ({ page }) => {
    // 获取初始卡片数量
    const initialCards = await page.locator('[data-testid^="canvas-card-"]').count()

    // 双击画布添加新卡片
    await page.locator('[data-testid="canvas-stage"]').dblclick({
      position: { x: 400, y: 300 },
    })

    // 验证新卡片已添加
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 1)

    // 使用 Ctrl+Z 撤销
    await page.keyboard.press('Control+z')

    // 验证卡片已被撤销
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards)

    // 使用 Ctrl+Shift+Z 重做
    await page.keyboard.press('Control+Shift+z')

    // 验证卡片已被重做
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 1)
  })

  test('应该在输入框获得焦点时禁用快捷键', async ({ page }) => {
    // 选择第一个卡片进入编辑模式
    const firstCard = page.locator('[data-testid^="canvas-card-"]').first()
    await firstCard.dblclick()

    // 等待输入框出现并获得焦点
    const input = page.locator('input[type="text"], textarea').first()
    await expect(input).toBeVisible()
    await input.focus()

    // 在输入框中输入文本
    await input.fill('测试文本')

    // 尝试使用 Ctrl+Z，应该不会触发撤销功能
    await page.keyboard.press('Control+z')

    // 验证输入框中的文本没有被撤销功能影响
    await expect(input).toHaveValue('测试文本')
  })

  test('应该正确处理多个连续操作的撤销/重做', async ({ page }) => {
    const initialCards = await page.locator('[data-testid^="canvas-card-"]').count()

    // 执行多个操作
    // 1. 添加第一个卡片
    await page.locator('[data-testid="canvas-stage"]').dblclick({
      position: { x: 400, y: 300 },
    })
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 1)

    // 2. 添加第二个卡片
    await page.locator('[data-testid="canvas-stage"]').dblclick({
      position: { x: 500, y: 400 },
    })
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 2)

    // 3. 添加第三个卡片
    await page.locator('[data-testid="canvas-stage"]').dblclick({
      position: { x: 600, y: 500 },
    })
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 3)

    // 撤销三次
    await page.keyboard.press('Control+z')
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 2)

    await page.keyboard.press('Control+z')
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 1)

    await page.keyboard.press('Control+z')
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards)

    // 重做两次
    await page.keyboard.press('Control+y')
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 1)

    await page.keyboard.press('Control+y')
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 2)

    // 再次重做
    await page.keyboard.press('Control+y')
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards + 3)
  })
})
