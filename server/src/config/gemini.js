import dotenv from 'dotenv';
dotenv.config();

let activeApiKey = process.env.GEMINI_API_KEY || '';

export const getGeminiApiKey = () => activeApiKey;

export const setGeminiApiKey = (key) => {
  activeApiKey = (key || '').trim();
  return hasValidApiKey();
};

export const hasValidApiKey = () => {
  return typeof activeApiKey === 'string' && activeApiKey.length > 10;
};

export const getAIStatus = () => {
  const hasKey = hasValidApiKey();
  return {
    configured: hasKey,
    keyMasked: hasKey ? `${activeApiKey.slice(0, 6)}...${activeApiKey.slice(-4)}` : 'Not Set',
    mode: hasKey ? 'live-gemini' : 'smart-simulation',
    model: 'gemini-1.5-flash'
  };
};
