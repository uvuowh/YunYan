<template>
  <aside class="file-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Collapse Toggle Button -->
    <button @click="toggleCollapsed" class="collapse-toggle" :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline :points="isCollapsed ? '15 18 9 12 15 6' : '9 18 15 12 9 6'"></polyline>
      </svg>
    </button>

    <div v-if="!isCollapsed" class="sidebar-content">
      <!-- Header -->
      <div class="sidebar-header">
        <h3>Files</h3>
      </div>
      <!-- File Actions Section -->
      <div class="section">
        <div v-if="selectedFolder" class="selected-folder-info">
          <span class="selected-folder-label">Selected:</span>
          <span class="selected-folder-path">{{ selectedFolder.replace(userDataFolder || '', '').replace(/^\//, '') || 'Root' }}</span>
          <button @click="selectedFolder = null" class="clear-selection-btn" title="Clear selection">×</button>
        </div>

        <div class="action-buttons compact">
          <button @click="fileManager.newFile" class="action-btn" title="New File">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </button>

          <button @click="fileManager.openFile" class="action-btn" title="Open File" :disabled="fileManager.isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"></path>
              <path d="M14 2l6 6"></path>
              <path d="M14 2v6h6"></path>
            </svg>
          </button>

          <button @click="fileManager.saveFile" class="action-btn" title="Save File" :disabled="fileManager.isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
              <path d="M9 7h6"></path>
            </svg>
          </button>

          <button @click="fileManager.saveAsFile" class="action-btn" title="Save As" :disabled="fileManager.isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
              <path d="M9 7h6"></path>
              <path d="M16 8l3-3"></path>
              <path d="M19 5l-3 3"></path>
            </svg>
          </button>

          <button @click="createNewFolder" class="action-btn" :title="selectedFolder ? `Create folder in ${selectedFolder}` : 'Create folder in root (click a folder first to create inside it)'" :disabled="!userDataFolder || isCreatingFolder">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </button>

          <button @click="showSettings = !showSettings" class="action-btn" :class="{ active: showSettings }" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24M7.76 16.24l-4.24 4.24m12.48 0l-4.24-4.24M7.76 7.76L3.52 3.52"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Settings Section -->
      <div v-if="showSettings" class="section settings-section">
        <div class="section-header">
          <h4>Settings</h4>
        </div>
        <div class="settings-content">
          <div class="setting-item">
            <label>User Data Folder:</label>
            <div class="folder-setting">
              <div v-if="userDataFolder" class="current-folder">
                <span class="folder-path">{{ userDataFolder }}</span>
                <button @click="settingsStore.clearUserDataFolder" class="clear-folder-btn" title="Clear folder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <button @click="selectUserDataFolder" class="select-folder-btn" :disabled="settingsStore.isLoading">
                {{ userDataFolder ? 'Change Folder' : 'Select Folder' }}
              </button>
            </div>
          </div>

          <!-- Status Messages -->
          <div v-if="settingsStore.lastError" class="status-message error">
            {{ settingsStore.lastError }}
          </div>
          <div v-if="settingsStore.lastSuccess" class="status-message success">
            {{ settingsStore.lastSuccess }}
          </div>
        </div>
      </div>

      <!-- Current File Section -->
      <div class="section">
        <div class="section-header">
          <h4>Current File</h4>
        </div>
        <div class="current-file">
          <div class="file-name">
            {{ fileManager.currentFileName }}
            <span v-if="fileManager.isModified" class="modified-indicator">●</span>
          </div>
          <div v-if="fileManager.currentFilePath" class="file-path">
            {{ fileManager.currentFilePath }}
          </div>
        </div>
      </div>

      <!-- Document Tree Section -->
      <div class="section">
        <div class="section-header">
          <h4>Document Tree</h4>
          <button @click="refreshDocumentTree" class="refresh-btn" title="Refresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
        <div class="document-tree">
          <div v-if="!userDataFolder" class="empty-state">
            <p>Please select a user data folder in Settings</p>
          </div>
          <div v-else-if="documentTree.length === 0" class="empty-state">
            <p>No files found in selected folder</p>
          </div>
          <div v-else class="tree-help">
            <p class="tree-help-text">📁 Click folders to expand/collapse • 📄 Click files to open</p>
          </div>
          <div v-else>
            <div
              v-for="item in documentTree"
              :key="item.path"
              class="tree-item"
              :class="{ 'is-folder': item.isFolder, 'is-current': item.path === fileManager.currentFilePath, 'selected': item.isFolder && selectedFolder === item.path }"
              :style="{ paddingLeft: `${item.level * 16 + 8}px` }"
              @click="handleTreeItemClick(item)"
            >
              <div class="tree-item-content">
                <!-- 展开/折叠箭头 -->
                <div v-if="item.isFolder" class="expand-arrow" :class="{ expanded: item.expanded }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                <div v-else class="expand-spacer"></div>

                <!-- 文件/文件夹图标 -->
                <svg v-if="item.isFolder" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="folder-icon">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="file-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span class="tree-item-name">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Files Section -->
      <div class="section">
        <div class="section-header">
          <h4>Recent Files</h4>
          <button 
            v-if="fileManager.recentFiles.length > 0" 
            @click="fileManager.clearRecentFiles" 
            class="clear-button"
            title="Clear recent files"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="fileManager.recentFiles.length === 0" class="empty-state">
          <p>No recent files</p>
        </div>
        
        <div v-else class="recent-files">
          <div 
            v-for="file in fileManager.recentFiles" 
            :key="file.id"
            class="recent-file-item"
            @click="openRecentFile(file)"
          >
            <div class="file-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">{{ formatDate(file.lastModified) }}</div>
            </div>
            <button 
              @click.stop="fileManager.removeFromRecentFiles(file.path)" 
              class="remove-button"
              title="Remove from recent files"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Status Section -->
      <div v-if="fileManager.lastError || fileManager.lastSuccess || fileManager.isLoading" class="section">
        <div class="status-messages">
          <div v-if="fileManager.isLoading" class="status-message loading">
            <div class="spinner"></div>
            Loading...
          </div>
          <div v-if="fileManager.lastError" class="status-message error">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {{ fileManager.lastError }}
          </div>
          <div v-if="fileManager.lastSuccess" class="status-message success">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {{ fileManager.lastSuccess }}
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useFileManagerStore, type RecentFile } from '@/store/fileManager';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import { readDir, mkdir } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';

interface DocumentTreeItem {
  name: string;
  path: string;
  isFolder: boolean;
  level: number; // 层级深度，用于缩进
  expanded?: boolean; // 文件夹是否展开
  children?: DocumentTreeItem[]; // 子项目
}

const fileManager = useFileManagerStore();
const settingsStore = useSettingsStore();
const { userDataFolder } = storeToRefs(settingsStore);
const isCollapsed = ref(false);
const documentTree = ref<DocumentTreeItem[]>([]);
const showSettings = ref(false);
const isCreatingFolder = ref(false);
const selectedFolder = ref<string | null>(null);

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 选择用户数据文件夹
const selectUserDataFolder = async () => {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select User Data Folder'
    });

    if (selected && typeof selected === 'string') {
      settingsStore.setUserDataFolder(selected);
    }
  } catch (error) {
    console.error('Failed to select folder:', error);
  }
};

const refreshDocumentTree = async () => {
  if (!userDataFolder.value) {
    documentTree.value = [];
    return;
  }

  try {
    const treeData = await buildFileTree(userDataFolder.value, 0);
    documentTree.value = flattenTree(treeData);
  } catch (error) {
    console.error('Failed to read directory:', error);
    documentTree.value = [];
  }
};

// 构建文件树
const buildFileTree = async (dirPath: string, level: number): Promise<DocumentTreeItem[]> => {
  try {
    const entries = await readDir(dirPath);
    const items: DocumentTreeItem[] = [];

    for (const entry of entries) {
      const item: DocumentTreeItem = {
        name: entry.name,
        path: `${dirPath}/${entry.name}`,
        isFolder: entry.isDirectory,
        level,
        expanded: false
      };

      if (entry.isDirectory) {
        // 对于文件夹，递归读取子项目
        try {
          item.children = await buildFileTree(item.path, level + 1);
        } catch (error) {
          // 如果无法读取子文件夹，设为空数组
          item.children = [];
        }
      }

      items.push(item);
    }

    // 排序：文件夹在前，然后按名称排序
    return items.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error(`Failed to read directory ${dirPath}:`, error);
    return [];
  }
};

const flattenTree = (items: DocumentTreeItem[]): DocumentTreeItem[] => {
  const result: DocumentTreeItem[] = [];

  const traverse = (items: DocumentTreeItem[]) => {
    for (const item of items) {
      result.push(item);
      if (item.isFolder && item.expanded && item.children) {
        traverse(item.children);
      }
    }
  };

  traverse(items);
  return result;
};

const handleTreeItemClick = async (item: DocumentTreeItem) => {
  if (item.isFolder) {
    // 设置选中的文件夹
    selectedFolder.value = item.path;
    // 切换文件夹展开/折叠状态
    item.expanded = !item.expanded;
    await refreshDocumentTree(); // 重新生成扁平化列表
  } else {
    // 尝试打开真实文件
    try {
      await fileManager.openFromPath(item.path);
    } catch (error) {
      fileManager.setError(`Failed to open file: ${error}`);
    }
  }
};

const createNewFolder = async () => {
  console.log('createNewFolder called');
  console.log('userDataFolder:', userDataFolder.value);
  console.log('selectedFolder:', selectedFolder.value);
  console.log('isCreatingFolder:', isCreatingFolder.value);

  if (!userDataFolder.value || isCreatingFolder.value) return;

  // 确定创建文件夹的目标路径
  const targetPath = selectedFolder.value || userDataFolder.value;

  const folderName = prompt(`请输入文件夹名称 (将在 ${targetPath} 中创建):`);
  if (!folderName || folderName.trim() === '') return;

  try {
    isCreatingFolder.value = true;
    const newFolderPath = `${targetPath}/${folderName.trim()}`;

    console.log('Creating folder at:', newFolderPath);

    await mkdir(newFolderPath, { recursive: true });

    // 刷新文件树
    await refreshDocumentTree();

    settingsStore.setSuccessMessage(`文件夹 "${folderName}" 创建成功`);
  } catch (error) {
    console.error('创建文件夹失败:', error);
    settingsStore.setErrorMessage(`创建文件夹失败: ${error}`);
  } finally {
    isCreatingFolder.value = false;
  }
};

// 监听用户数据文件夹变化
watch(userDataFolder, async () => {
  await refreshDocumentTree();
}, { immediate: true });

onMounted(() => {
  refreshDocumentTree();
});

const openRecentFile = async (file: RecentFile) => {
  try {
    await fileManager.openFromPath(file.path);
  } catch (error) {
    fileManager.setError(`Failed to open file: ${error}`);
    // Remove invalid file from recent files
    fileManager.removeFromRecentFiles(file.path);
  }
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};
</script>

<style scoped>
.file-sidebar {
  width: 280px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: width 0.3s ease;
  position: relative;
}

.file-sidebar.collapsed {
  width: 40px;
}

.collapse-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  z-index: 10;
}

.collapse-toggle:hover {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.sidebar-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-nav);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.section {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-header h4 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* Compact Action Buttons */
.action-buttons.compact {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.action-btn {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover:not(:disabled) {
  background-color: var(--color-accent-primary);
  color: white;
  border-color: var(--color-accent-primary);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.active {
  background-color: var(--color-accent-primary);
  color: white;
  border-color: var(--color-accent-primary);
}

.folder-icon {
  color: #ffa726;
}

.file-icon {
  color: #42a5f5;
}

.selected-folder-info {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.selected-folder-label {
  font-weight: 500;
  color: #666;
}

.selected-folder-path {
  color: #1976d2;
  font-family: monospace;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-selection-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-selection-btn:hover {
  background: #e0e0e0;
  color: #666;
}

/* Current File */
.current-file {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.75rem;
}

.file-name {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modified-indicator {
  color: var(--color-accent-primary);
  font-size: 1.2em;
}

.file-path {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
  word-break: break-all;
}

/* Document Tree */
.document-tree {
  max-height: 200px;
  overflow-y: auto;
}

.tree-help {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.tree-help-text {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
  line-height: 1.3;
}

.tree-item {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 1px;
}

.tree-item:hover {
  background-color: var(--color-bg-primary);
}

.tree-item.is-current {
  background-color: var(--color-accent-primary);
  color: white;
}

.tree-item.selected {
  background-color: #e3f2fd;
  border-left: 3px solid #1976d2;
}

.tree-item.is-folder {
  font-weight: 500;
}

.tree-item-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.expand-arrow {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.expand-arrow.expanded {
  transform: rotate(90deg);
}

.expand-spacer {
  width: 12px;
  height: 12px;
}

.tree-item-name {
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Recent Files and other existing styles */
.empty-state {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.recent-files {
  max-height: 150px;
  overflow-y: auto;
}

.recent-file-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 1px;
}

.recent-file-item:hover {
  background-color: var(--color-bg-primary);
}

.file-icon {
  margin-right: 0.5rem;
  color: var(--color-text-secondary);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-details .file-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.file-meta {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin-top: 0.1rem;
}

.clear-button, .remove-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.clear-button:hover, .remove-button:hover {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* Status Messages */
.status-messages {
  padding: 0.5rem;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.status-message.loading {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-message.error {
  background-color: #ffebee;
  color: #d32f2f;
}

.status-message.success {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e3f2fd;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Settings Section */
.settings-section {
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.settings-content {
  padding: 0.5rem 0;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.folder-setting {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.current-folder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.folder-path {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  flex: 1;
  word-break: break-all;
}

.clear-folder-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 2px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-folder-btn:hover {
  background: var(--color-bg-primary);
  color: var(--color-accent-primary);
}

.select-folder-btn {
  background: var(--color-accent-primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s ease;
}

.select-folder-btn:hover:not(:disabled) {
  background: var(--color-accent-secondary);
}

.select-folder-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-message {
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.status-message.error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.status-message.success {
  background: #efe;
  color: #363;
  border: 1px solid #cfc;
}

</style>
