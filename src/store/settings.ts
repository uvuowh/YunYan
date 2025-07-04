import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const userDataFolder = ref<string | null>(null);
  const isLoading = ref(false);
  const lastError = ref<string | null>(null);
  const lastSuccess = ref<string | null>(null);

  // Initialize settings from localStorage
  const initStore = () => {
    loadSettings();
  };

  // Set error message
  const setError = (message: string | null) => {
    lastError.value = message;
    if (message) {
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

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const savedFolder = localStorage.getItem('yunyan_userDataFolder');
      if (savedFolder) {
        userDataFolder.value = savedFolder;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      if (userDataFolder.value) {
        localStorage.setItem('yunyan_userDataFolder', userDataFolder.value);
      } else {
        localStorage.removeItem('yunyan_userDataFolder');
      }
    } catch (error) {
      setError(`Failed to save settings: ${error}`);
    }
  };

  // Set user data folder
  const setUserDataFolder = (folderPath: string) => {
    try {
      isLoading.value = true;
      setError(null);

      userDataFolder.value = folderPath;
      saveSettings();

      setSuccess(`User data folder set to: ${folderPath}`);
    } catch (error) {
      setError(`Failed to set user data folder: ${error}`);
    } finally {
      isLoading.value = false;
    }
  };

  // Clear user data folder
  const clearUserDataFolder = () => {
    try {
      isLoading.value = true;
      setError(null);

      userDataFolder.value = null;
      saveSettings();

      setSuccess('User data folder cleared');
    } catch (error) {
      setError(`Failed to clear user data folder: ${error}`);
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize store on first use
  initStore();

  return {
    userDataFolder,
    isLoading,
    lastError,
    lastSuccess,
    setUserDataFolder,
    clearUserDataFolder,
    loadSettings,
    saveSettings
  };
});
