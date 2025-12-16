
// This utility manages multiple API keys for failover/rotation.
// It reads from process.env (polyfilled by Vite)

const getAvailableKeys = () => {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
    process.env.API_KEY_4,
    process.env.API_KEY_5
  ];
  // Filter out undefined or empty keys
  return keys.filter(key => key && key.trim().length > 0) as string[];
};

// Global state for the current key index
let currentKeyIndex = 0;

export const getApiKey = (): string => {
  const keys = getAvailableKeys();
  if (keys.length === 0) {
    console.error("No API Keys found in environment variables.");
    return '';
  }
  // Safety check to ensure index is within bounds
  if (currentKeyIndex >= keys.length) {
    currentKeyIndex = 0;
  }
  return keys[currentKeyIndex];
};

export const rotateApiKey = (): boolean => {
  const keys = getAvailableKeys();
  if (keys.length <= 1) return false; // Can't rotate if only 1 or 0 keys

  const previousIndex = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  
  console.log(`API Key rotated from index ${previousIndex} to ${currentKeyIndex}`);
  return true;
};
