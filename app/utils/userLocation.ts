import axios from "axios";

// Fetch user data from ipdata.co
export async function getUserCountry() {
  const IPDATA_API_KEY = process.env.VITE_REACT_APP_IPDATA_API_KEY;
  const url = `https://api.ipdata.co/?api-key=520a83d66268292f5b97ca64c496ef3b9cfb1bb1f85f2615b103f66f`;

  try {
    const response = await axios.get(url);
    const {
      city: city,
      country_name: country,
      country_code: countryCode,
      emoji_flag: countryEmoji,
      ip,
      threat,
    } = response.data;
    const isVpnIpdata = threat
      ? threat.is_vpn ||
      threat.is_proxy ||
      threat.is_datacenter ||
      threat.is_tor
      : false;

    return { country, countryCode, countryEmoji, ip, isVpnIpdata, city };
  } catch (error) {
    console.error("Error fetching user data from ipdata.co:", error);
    return null;
  }
}
