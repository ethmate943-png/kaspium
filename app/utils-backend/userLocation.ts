interface IPDataResponse {
  city: string;
  country_name: string;
  country_code: string;
  emoji_flag: string;
  ip: string;
  threat?: {
    is_vpn?: boolean;
    is_proxy?: boolean;
    is_datacenter?: boolean;
    is_tor?: boolean;
  };
}

interface UserLocationData {
  country: string;
  countryCode: string;
  countryEmoji: string;
  ip: string;
  isVpnIpdata: boolean;
  city: string;
}

// Fetch user data from ipdata.co
export async function getUserCountry(): Promise<UserLocationData | null> {
  const url = `https://api.ipdata.co/?api-key=520a83d66268292f5b97ca64c496ef3b9cfb1bb1f85f2615b103f66f`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: IPDataResponse = await response.json();
    const {
      city,
      country_name: country,
      country_code: countryCode,
      emoji_flag: countryEmoji,
      ip,
      threat,
    } = data;
    
    const isVpnIpdata = threat
      ? threat.is_vpn ||
        threat.is_proxy ||
        threat.is_datacenter ||
        threat.is_tor || false
      : false;

    return { country, countryCode, countryEmoji, ip, isVpnIpdata, city };
  } catch (error) {
    console.error("Error fetching user data from ipdata.co:", error);
    return null;
  }
}

