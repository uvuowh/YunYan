import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';

export interface FileInfo {
  path: string;
  name: string;
  lastModified: Date;
  size?: number;
}

export interface RecentFile extends FileInfo {
  id: string;
}

export const useFileManagerStore = defineStore('fileManager', () => {
  const currentFilePath = ref<string | null>(null);
  const currentFileName = ref<string>('Untitled');
  const isModified = ref<boolean>(false);
  const recentFiles = reactive<RecentFile[]>([]);
  const isLoading = ref<boolean>(false);
  const lastError = ref<string | null>(null);
  const lastSuccess = ref<string | null>(null);

  // Load recent files from localStorage
  const loadRecentFiles = () => {
    try {
      const stored = localStorage.getItem('yunyan-recent-files');
      if (stored) {
        const parsed = JSON.parse(stored);
        recentFiles.splice(0, recentFiles.length, ...parsed.map((file: any) => ({
          ...file,
          lastModified: new Date(file.lastModified)
        })));
      }
    } catch (error) {
      console.warn('Failed to load recent files:', error);
    }
  };

  // Save recent files to localStorage
  const saveRecentFiles = () => {
    try {
      localStorage.setItem('yunyan-recent-files', JSON.stringify(recentFiles));
    } catch (error) {
      console.warn('Failed to save recent files:', error);
    }
  };

  // Add file to recent files list
  const addToRecentFiles = (filePath: string) => {
    const fileName = filePath.split('/').pop() || filePath;
    const existingIndex = recentFiles.findIndex(f => f.path === filePath);
    
    const fileInfo: RecentFile = {
      id: Date.now().toString(),
      path: filePath,
      name: fileName,
      lastModified: new Date()
    };

    if (existingIndex >= 0) {
      // Update existing file
      recentFiles.splice(existingIndex, 1);
    }
    
    // Add to beginning of list
    recentFiles.unshift(fileInfo);
    
    // Keep only last 10 files
    if (recentFiles.length > 10) {
      recentFiles.splice(10);
    }
    
    saveRecentFiles();
  };

  // Remove file from recent files
  const removeFromRecentFiles = (filePath: string) => {
    const index = recentFiles.findIndex(f => f.path === filePath);
    if (index >= 0) {
      recentFiles.splice(index, 1);
      saveRecentFiles();
    }
  };

  // Clear all recent files
  const clearRecentFiles = () => {
    recentFiles.splice(0, recentFiles.length);
    saveRecentFiles();
  };

  // Set loading state
  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  // Set error message
  const setError = (error: string | null) => {
    lastError.value = error;
    if (error) {
      setTimeout(() => {
        lastError.value = null;
      }, 5000);
    }
  };

  // Set success message
  const setSuccess = (message: string | null) => {
    lastSuccess.value = message;
    if (message) {
      setTimeout(() => {
        lastSuccess.value = null;
      }, 3000);
    }
  };

  // Mark file as modified
  const markAsModified = () => {
    isModified.value = true;
  };

  // Mark file as saved
  const markAsSaved = () => {
    isModified.value = false;
  };

  // Create new file
  const newFile = () => {
    // Import canvas store dynamically to avoid circular dependency
    import('./canvas').then(({ useCanvasStore }) => {
      const canvasStore = useCanvasStore();
      canvasStore.clearCanvas();
    });
    currentFilePath.value = null;
    currentFileName.value = 'Untitled';
    markAsSaved();
    setSuccess('New file created');
  };

  // Save current file
  const saveFile = async () => {
    if (currentFilePath.value) {
      return await saveToPath(currentFilePath.value);
    } else {
      return await saveAsFile();
    }
  };

  // Save file as (with dialog)
  const saveAsFile = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const filePath = await save({
        filters: [
          { name: 'YunYan Files', extensions: ['yunyan'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        defaultPath: currentFileName.value.endsWith('.yunyan') ? currentFileName.value : `${currentFileName.value}.yunyan`
      });

      if (!filePath) {
        setLoading(false);
        return false;
      }

      const success = await saveToPath(filePath);
      if (success) {
        currentFilePath.value = filePath;
        currentFileName.value = filePath.split('/').pop() || 'Untitled';
        addToRecentFiles(filePath);
      }
      
      return success;
    } catch (error) {
      setError(`Failed to save file: ${error}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save to specific path
  const saveToPath = async (filePath: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Import canvas store dynamically to avoid circular dependency
      const { useCanvasStore } = await import('./canvas');
      const canvasStore = useCanvasStore();

      const state = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        cards: Array.from(canvasStore.cards),
        connections: Array.from(canvasStore.connections),
        metadata: {
          cardCount: canvasStore.cards.length,
          connectionCount: canvasStore.connections.length
        }
      };

      await writeTextFile(filePath, JSON.stringify(state, null, 2));
      markAsSaved();
      setSuccess(`File saved: ${filePath.split('/').pop()}`);
      return true;
    } catch (error) {
      setError(`Failed to save file: ${error}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Open file with dialog
  const openFile = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const filePath = await open({
        filters: [
          { name: 'YunYan Files', extensions: ['yunyan'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        multiple: false,
      });

      if (!filePath) {
        setLoading(false);
        return false;
      }

      return await openFromPath(filePath.path);
    } catch (error) {
      setError(`Failed to open file: ${error}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Open file from specific path
  const openFromPath = async (filePath: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const content = await readTextFile(filePath);
      const state = JSON.parse(content);

      if (!state.cards || !state.connections) {
        throw new Error('Invalid file format');
      }

      // Import canvas store dynamically to avoid circular dependency
      const { useCanvasStore } = await import('./canvas');
      const canvasStore = useCanvasStore();
      canvasStore.clearCanvas();

      // Restore cards
      state.cards.forEach((card: any) => {
        canvasStore.cards.push(card);
      });

      // Restore connections
      state.connections.forEach((connection: any) => {
        canvasStore.connections.push(connection);
      });

      // Update next card ID
      if (state.cards.length > 0) {
        const maxId = Math.max(...state.cards.map((c: any) => c.id), -1);
        canvasStore.nextCardId = maxId + 1;
      }

      currentFilePath.value = filePath;
      currentFileName.value = filePath.split('/').pop() || 'Untitled';
      markAsSaved();
      addToRecentFiles(filePath);
      setSuccess(`File opened: ${currentFileName.value}`);
      return true;
    } catch (error) {
      setError(`Failed to open file: ${error}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initialize store
  loadRecentFiles();

  return {
    // State
    currentFilePath,
    currentFileName,
    isModified,
    recentFiles,
    isLoading,
    lastError,
    lastSuccess,
    
    // Actions
    newFile,
    saveFile,
    saveAsFile,
    openFile,
    openFromPath,
    markAsModified,
    markAsSaved,
    addToRecentFiles,
    removeFromRecentFiles,
    clearRecentFiles,
    setError,
    setSuccess
  };
});
