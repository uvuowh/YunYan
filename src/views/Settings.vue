<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>设置</h1>
    </div>

    <div class="settings-content">
      <div class="settings-section">
        <h2>外观</h2>
        <div class="setting-item">
          <label>主题模式</label>
          <div class="theme-options">
            <Button 
              v-for="mode in themeModes" 
              :key="mode.key"
              :variant="theme.mode === mode.key ? 'primary' : 'outline'"
              size="sm"
              @click="setTheme({ mode: mode.key })"
            >
              {{ mode.icon }} {{ mode.label }}
            </Button>
          </div>
        </div>
        
        <div class="setting-item">
          <label>主色调</label>
          <div class="color-picker">
            <input 
              type="color" 
              :value="theme.primaryColor"
              @input="setTheme({ primaryColor: $event.target.value })"
            />
            <span>{{ theme.primaryColor }}</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2>语言与地区</h2>
        <div class="setting-item">
          <label>界面语言</label>
          <select 
            :value="settings.language"
            @change="setSettings({ language: $event.target.value })"
            class="language-select"
          >
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h2>编辑器</h2>
        <div class="setting-item">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              :checked="settings.autoSave"
              @change="setSettings({ autoSave: $event.target.checked })"
            />
            <span class="checkmark"></span>
            自动保存
          </label>
          <p class="setting-description">编辑时自动保存内容</p>
        </div>
      </div>

      <div class="settings-section">
        <h2>同步</h2>
        <div class="setting-item">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              :checked="settings.syncEnabled"
              @change="setSettings({ syncEnabled: $event.target.checked })"
            />
            <span class="checkmark"></span>
            启用云同步
          </label>
          <p class="setting-description">将数据同步到云端</p>
        </div>
        
        <div v-if="settings.syncEnabled" class="sync-info">
          <div class="sync-status">
            <div class="status-indicator synced"></div>
            <span>同步正常</span>
          </div>
          <Button variant="outline" size="sm">
            立即同步
          </Button>
        </div>
      </div>

      <div class="settings-section">
        <h2>关于</h2>
        <div class="about-info">
          <div class="app-info">
            <h3>云雁</h3>
            <p>版本 0.1.0</p>
            <p>基于 Tauri + Vue 3 构建</p>
          </div>
          
          <div class="links">
            <Button variant="ghost" size="sm">
              检查更新
            </Button>
            <Button variant="ghost" size="sm">
              用户手册
            </Button>
            <Button variant="ghost" size="sm">
              反馈问题
            </Button>
          </div>
        </div>
      </div>

      <div class="settings-section danger-zone">
        <h2>危险操作</h2>
        <div class="setting-item">
          <label>重置应用</label>
          <p class="setting-description">这将清除所有数据并重置应用到初始状态</p>
          <Button variant="danger" size="sm" @click="confirmReset">
            重置应用
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import Button from '@/components/ui/Button.vue'

const appStore = useAppStore()

// Computed properties
const theme = computed(() => appStore.theme)
const settings = computed(() => appStore.settings)

// Actions
const { setTheme, setSettings } = appStore

const themeModes = [
  { key: 'light', icon: '☀️', label: '浅色' },
  { key: 'dark', icon: '🌙', label: '深色' },
  { key: 'auto', icon: '🔄', label: '跟随系统' }
] as const

function confirmReset() {
  if (confirm('确定要重置应用吗？这将清除所有数据，此操作不可撤销。')) {
    // TODO: Implement reset functionality
    alert('重置功能尚未实现')
  }
}
</script>

<style scoped>
.settings-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.settings-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.settings-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-section {
  margin-bottom: 3rem;
}

.settings-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-item label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.setting-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.theme-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-picker input[type="color"] {
  width: 3rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.color-picker span {
  font-family: monospace;
  color: var(--text-secondary);
}

.language-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.language-select:focus {
  outline: none;
  border-color: var(--accent-color);
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500 !important;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  position: relative;
  transition: all var(--transition-fast);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}

.sync-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-top: 1rem;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--success-color);
}

.about-info {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.app-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.app-info p {
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.links {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.danger-zone {
  border: 1px solid var(--error-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  background-color: rgba(239, 68, 68, 0.05);
}

.danger-zone h2 {
  color: var(--error-color);
  border-bottom-color: var(--error-color);
}

@media (max-width: 768px) {
  .settings-content {
    padding: 1rem;
  }
  
  .theme-options {
    flex-direction: column;
  }
  
  .sync-info {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .links {
    flex-direction: column;
  }
}
</style>
