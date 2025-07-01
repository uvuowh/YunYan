/**
 * 块ID生成器
 * 生成类似思源笔记的块ID格式：时间戳-随机字符串
 */

/**
 * 生成块ID
 * 格式: YYYYMMDDHHMMSS-随机字符串
 * 例如: 20240101120000-abc123def
 */
export function generateBlockId(): string {
  const now = new Date()
  
  // 生成时间戳部分 (YYYYMMDDHHMMSS)
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  
  const timestamp = `${year}${month}${day}${hour}${minute}${second}`
  
  // 生成随机字符串部分
  const randomPart = generateRandomString(11) // 11位随机字符串
  
  return `${timestamp}-${randomPart}`
}

/**
 * 生成引用ID
 * 格式: ref-时间戳-随机字符串
 */
export function generateReferenceId(): string {
  const blockId = generateBlockId()
  return `ref-${blockId}`
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * 验证块ID格式
 * @param id 块ID
 * @returns 是否为有效的块ID格式
 */
export function isValidBlockId(id: string): boolean {
  // 格式: 14位时间戳-11位随机字符串
  const pattern = /^\d{14}-[a-zA-Z0-9]{11}$/
  return pattern.test(id)
}

/**
 * 从块ID中提取时间戳
 * @param id 块ID
 * @returns 时间戳 (毫秒)
 */
export function extractTimestampFromId(id: string): number {
  if (!isValidBlockId(id)) {
    throw new Error('Invalid block ID format')
  }
  
  const timestampStr = id.split('-')[0]
  
  // 解析时间戳字符串 YYYYMMDDHHMMSS
  const year = parseInt(timestampStr.substring(0, 4))
  const month = parseInt(timestampStr.substring(4, 6)) - 1 // 月份从0开始
  const day = parseInt(timestampStr.substring(6, 8))
  const hour = parseInt(timestampStr.substring(8, 10))
  const minute = parseInt(timestampStr.substring(10, 12))
  const second = parseInt(timestampStr.substring(12, 14))
  
  return new Date(year, month, day, hour, minute, second).getTime()
}

/**
 * 生成内容哈希
 * @param content 内容字符串
 * @returns 哈希值
 */
export async function generateContentHash(content: string): Promise<string> {
  // 检查是否在浏览器环境中
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // 使用 Web Crypto API 生成 SHA-256 哈希
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } else {
    // 在 Node.js 环境中使用简单的哈希算法
    return simpleHash(content)
  }
}

/**
 * 简单哈希算法（用于测试环境）
 * @param content 内容字符串
 * @returns 哈希值
 */
function simpleHash(content: string): string {
  let hash = 0
  if (content.length === 0) return hash.toString(16)

  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }

  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * 生成短哈希 (用于显示)
 * @param fullHash 完整哈希
 * @param length 短哈希长度
 * @returns 短哈希
 */
export function generateShortHash(fullHash: string, length: number = 8): string {
  return fullHash.substring(0, length)
}
