#!/usr/bin/env node

/**
 * Cloudflare Free Plan Setup Script (Simplified)
 * 
 * This is a simplified version that focuses ONLY on what works on Free plan.
 * Creates the 3 essential firewall rules that provide strong protection.
 * 
 * Usage:
 *   npm run cloudflare:setup:free
 *   or
 *   node scripts/setup-cloudflare-free.mjs
 */

import fetch from 'node-fetch';
import 'dotenv/config';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

// Only the 3 essential rules that work on Free plan
const ESSENTIAL_RULES = [
  {
    name: 'Allow Verified Bots',
    description: 'Allow all Cloudflare-verified bots (Googlebot, Bingbot, etc.) - MUST BE FIRST',
    priority: 1,
    action: 'allow',
    condition: '(cf.client.bot)',
  },
  {
    name: 'Block Fake Googlebots',
    description: 'Block requests claiming to be Googlebot but not verified by Cloudflare',
    priority: 2,
    action: 'block',
    condition: '(http.user_agent contains "Googlebot" and not cf.client.bot)',
  },
  {
    name: 'Block Data Center Traffic',
    description: 'Block known data center ASNs (AWS, Azure, DigitalOcean, OVH) - safe for SEO',
    priority: 3,
    action: 'block',
    condition: '(ip.geoip.asnum in {16509 14061 8075 16276})',
  },
];

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${CLOUDFLARE_API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      const errorMessages = data.errors?.map(err => 
        `${err.message} (code: ${err.code || 'unknown'})`
      ).join(', ') || `HTTP ${response.status}`;
      throw new Error(errorMessages);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

async function createFirewallRule(rule) {
  // Cloudflare API format: filter must be an array with one object
  const payload = [
    {
      action: rule.action,
      priority: rule.priority,
      paused: false,
      description: rule.description,
      filter: {
        expression: rule.condition,
        paused: false,
      },
    }
  ];

  try {
    const response = await apiRequest(
      `/zones/${ZONE_ID}/firewall/rules`,
      'POST',
      payload
    );
    
    if (response.success && response.result && response.result.length > 0) {
      log(`Created: ${rule.name}`, 'success');
      return response.result[0];
    } else {
      // Try alternative format (single object instead of array)
      const altPayload = {
        action: rule.action,
        priority: rule.priority,
        paused: false,
        description: rule.description,
        filter: {
          expression: rule.condition,
          paused: false,
        },
      };
      
      const altResponse = await apiRequest(
        `/zones/${ZONE_ID}/firewall/rules`,
        'POST',
        altPayload
      );
      
      if (altResponse.success) {
        log(`Created: ${rule.name}`, 'success');
        return altResponse.result;
      }
      
      throw new Error(`API returned success: false - ${JSON.stringify(response.errors || altResponse.errors || response)}`);
    }
  } catch (error) {
    // Provide more detailed error information
    if (error.message.includes('malformed_request_body') || error.message.includes('10014')) {
      log(`⚠️  API format error (code 10014). This might be a plan limitation.`, 'warn');
      log(`   The Free plan may have API restrictions for firewall rules.`, 'info');
      log(`   💡 Solution: Set up rules manually in the dashboard:`, 'info');
      log(`   See: CLOUDFLARE_DASHBOARD_SETUP.md`, 'info');
      log(`   Or check: https://dash.cloudflare.com → Security → WAF → Firewall rules`, 'info');
    }
    throw error;
  }
}

async function verifyZone() {
  const response = await apiRequest(`/zones/${ZONE_ID}`);
  if (response.success) {
    log(`Zone verified: ${response.result.name}`, 'success');
    return true;
  }
  return false;
}

async function setup() {
  log('Cloudflare Free Plan Setup\n');
  log('Creating 3 essential firewall rules...\n');

  // Validate
  if (!API_TOKEN || !ZONE_ID) {
    log('Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID in .env file', 'error');
    process.exit(1);
  }

  // Verify zone
  const zoneValid = await verifyZone();
  if (!zoneValid) {
    log('Cannot access zone. Check your API token and Zone ID.', 'error');
    process.exit(1);
  }

  // Create rules
  let created = 0;
  for (const rule of ESSENTIAL_RULES) {
    try {
      await createFirewallRule(rule);
      created++;
    } catch (error) {
      log(`Failed "${rule.name}": ${error.message}`, 'error');
    }
  }

  // Summary
  log('\n' + '='.repeat(50));
  log(`Setup complete! ${created}/3 rules created.`, 'success');
  log('='.repeat(50));
  log('\n📝 Next steps:');
  log('1. Cloudflare Dashboard → Security → WAF → Firewall rules');
  log('2. Verify "Allow Verified Bots" is at the top');
  log('3. Enable Bot Fight Mode: Security → Bots');
  log('4. Check Security → Events for blocked traffic\n');
}

setup().catch(error => {
  log(`Setup failed: ${error.message}`, 'error');
  process.exit(1);
});

