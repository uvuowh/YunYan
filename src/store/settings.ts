import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const isLoading = ref(false);
  const lastError = ref<string | null>(null);
  const lastSuccess = ref<string | null>(null);

  // Set error message
  const setErrorMessage = (message: string | null) => {
    lastError.value = message;
    if (message) {
      setTimeout(() => {
        lastError.value = null;
      }, 5000);
    }
  };

  // Set success message
  const setSuccessMessage = (message: string | null) => {
    lastSuccess.value = message;
    if (message) {
      setTimeout(() => {
        lastSuccess.value = null;
      }, 3000);
    }
  };

  return {
    isLoading,
    lastError,
    lastSuccess,
    setErrorMessage,
    setSuccessMessage
  };
});
