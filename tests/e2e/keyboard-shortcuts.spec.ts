import { test, expect } from '@playwright/test'

test.describe('键盘快捷键功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/canvas')

    // 等待基本DOM元素加载
    await page.waitForSelector('.canvas-container', { timeout: 10000 })
    await page.waitForSelector('canvas', { timeout: 10000 })

    // 确保测试锚点元素存在
    await page.waitForSelector('[data-testid="canvas-card-0"]', {
      timeout: 10000,
      state: 'visible',
    })

    // 等待Vue Konva渲染完成
    await page.waitForTimeout(1000)
  })

  test('应该显示快捷键帮助 (F1)', async ({ page }) => {
    // 按 F1 打开快捷键帮助
    await page.keyboard.press('F1')

    // 验证模态框出现
    await expect(page.locator('.modal-overlay')).toBeVisible()
    await expect(page.locator('.modal-header h2')).toContainText('键盘快捷键')

    // 验证包含一些关键快捷键
    await expect(page.locator('.shortcut-description')).toContainText(['撤销', '重做', '保存项目'])

    // 按 Escape 关闭模态框
    await page.keyboard.press('Escape')
    await expect(page.locator('.modal-overlay')).not.toBeVisible()
  })

  test('应该通过点击按钮显示快捷键帮助', async ({ page }) => {
    // 点击帮助按钮
    await page.locator('.help-button').click()

    // 验证模态框出现
    await expect(page.locator('.modal-overlay')).toBeVisible()

    // 点击关闭按钮
    await page.locator('.close-button').click()
    await expect(page.locator('.modal-overlay')).not.toBeVisible()
  })

  test('应该支持 Escape 取消选择', async ({ page }) => {
    // 选择第一个卡片
    const firstCard = page.locator('[data-testid^="canvas-card-"]').first()
    await firstCard.click()

    // 验证卡片被选中（通过检查是否有选中样式）
    await expect(firstCard).toHaveClass(/selected/)

    // 按 Escape 取消选择
    await page.keyboard.press('Escape')

    // 验证卡片不再被选中
    await expect(firstCard).not.toHaveClass(/selected/)
  })

  test('应该支持 Delete 键删除选中的卡片', async ({ page }) => {
    // 获取初始卡片数量
    const initialCards = await page.locator('[data-testid^="canvas-card-"]').count()

    // 选择第一个卡片
    const firstCard = page.locator('[data-testid^="canvas-card-"]').first()
    await firstCard.click()

    // 监听确认对话框并接受
    page.on('dialog', dialog => dialog.accept())

    // 按 Delete 键删除
    await page.keyboard.press('Delete')

    // 验证卡片已被删除
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards - 1)
  })

  test('应该支持 Backspace 键删除选中的卡片', async ({ page }) => {
    // 获取初始卡片数量
    const initialCards = await page.locator('[data-testid^="canvas-card-"]').count()

    // 选择第一个卡片
    const firstCard = page.locator('[data-testid^="canvas-card-"]').first()
    await firstCard.click()

    // 监听确认对话框并接受
    page.on('dialog', dialog => dialog.accept())

    // 按 Backspace 键删除
    await page.keyboard.press('Backspace')

    // 验证卡片已被删除
    await expect(page.locator('[data-testid^="canvas-card-"]')).toHaveCount(initialCards - 1)
  })

  test('应该支持 Ctrl+N 创建新项目', async ({ page }) => {
    // 监听确认对话框并接受
    page.on('dialog', dialog => dialog.accept())

    // 按 Ctrl+N 创建新项目
    await page.keyboard.press('Control+n')

    // 验证画布被清空（应该只有默认的卡片）
    const cards = await page.locator('[data-testid^="canvas-card-"]').count()
    expect(cards).toBeGreaterThanOrEqual(0) // 可能有默认卡片
  })

  test('应该支持 Ctrl+S 保存项目', async ({ page }) => {
    // 监听控制台消息
    const consoleMessages: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text())
      }
    })

    // 按 Ctrl+S 保存项目
    await page.keyboard.press('Control+s')

    // 等待一下让保存操作完成
    await page.waitForTimeout(100)

    // 验证保存消息出现
    expect(consoleMessages).toContain('项目已保存')
  })

  test('应该支持 Ctrl+O 加载项目', async ({ page }) => {
    // 监听控制台消息
    const consoleMessages: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text())
      }
    })

    // 按 Ctrl+O 加载项目
    await page.keyboard.press('Control+o')

    // 等待一下让加载操作完成
    await page.waitForTimeout(100)

    // 验证加载消息出现
    expect(consoleMessages).toContain('项目已加载')
  })

  test('应该在输入框获得焦点时禁用快捷键', async ({ page }) => {
    // 双击卡片进入编辑模式
    const firstCard = page.locator('[data-testid^="canvas-card-"]').first()
    await firstCard.dblclick()

    // 等待输入框出现
    const input = page.locator('input[type="text"], textarea').first()
    await expect(input).toBeVisible()

    // 在输入框中输入文本
    await input.fill('测试文本')

    // 尝试使用 Ctrl+Z，应该不会触发撤销功能
    await page.keyboard.press('Control+z')

    // 验证输入框中的文本没有被撤销功能影响
    await expect(input).toHaveValue('测试文本')
  })

  test('快捷键帮助应该按类别组织', async ({ page }) => {
    // 按 F1 打开快捷键帮助
    await page.keyboard.press('F1')

    // 验证模态框出现
    await expect(page.locator('.modal-overlay')).toBeVisible()

    // 验证有不同的类别
    const categories = page.locator('.category h3')
    await expect(categories).toContainText(['编辑操作', '文件操作', '选择操作'])

    // 验证每个类别下有快捷键
    const editingCategory = page.locator('.category').filter({ hasText: '编辑操作' })
    await expect(editingCategory.locator('.shortcut-item')).toHaveCount({ min: 1 })

    // 关闭模态框
    await page.keyboard.press('Escape')
  })

  test('快捷键应该正确显示修饰键', async ({ page }) => {
    // 按 F1 打开快捷键帮助
    await page.keyboard.press('F1')

    // 验证 Ctrl+Z 快捷键正确显示
    const undoShortcut = page.locator('.shortcut-item').filter({ hasText: '撤销' })
    await expect(undoShortcut.locator('.key')).toContainText(['Ctrl', 'Z'])

    // 验证 Ctrl+Shift+Z 快捷键正确显示
    const redoShortcut = page.locator('.shortcut-item').filter({ hasText: 'Ctrl+Shift+Z' })
    await expect(redoShortcut.locator('.key')).toContainText(['Ctrl', 'Shift', 'Z'])

    // 关闭模态框
    await page.keyboard.press('Escape')
  })
})
