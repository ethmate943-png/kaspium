#!/usr/bin/env node

/**
 * Create the remaining 2 Cloudflare firewall rules
 * This script creates rules 2 and 3 that couldn't be created due to rule limits
 * 
 * Usage: node scripts/create-remaining-rules.mjs
 */

import fetch from 'node-fetch';
import 'dotenv/config';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

const REMAINING_RULES = [
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

async function getExistingRules() {
  try {
    const response = await apiRequest(`/zones/${ZONE_ID}/firewall/rules`);
    return response.result || [];
  } catch (error) {
    log(`Failed to fetch rules: ${error.message}`, 'error');
    return [];
  }
}

async function createFirewallRule(rule) {
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
    
    if (response.success) {
      const result = Array.isArray(response.result) ? response.result[0] : response.result;
      if (result) {
        log(`Created: ${rule.name}`, 'success');
        return result;
      }
    }
    
    // Try single object format
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
    
    throw new Error(`API returned success: false`);
  } catch (error) {
    throw error;
  }
}

async function setup() {
  log('Creating Remaining Cloudflare Rules\n');

  if (!API_TOKEN || !ZONE_ID) {
    log('Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID in .env file', 'error');
    process.exit(1);
  }

  // Check existing rules
  log('Checking existing rules...\n');
  const existingRules = await getExistingRules();
  log(`Found ${existingRules.length} existing firewall rules\n`);

  if (existingRules.length >= 5) {
    log('⚠️  You have reached the Free plan limit (~5 rules)', 'warn');
    log('   You may need to delete some existing rules first.', 'info');
    log('   Or create these rules manually in the dashboard.\n', 'info');
  }

  // Create remaining rules
  let created = 0;
  for (const rule of REMAINING_RULES) {
    // Check if rule already exists
    const exists = existingRules.some(existing => {
      const existingExpr = existing.filter?.expression;
      return existingExpr === rule.condition;
    });

    if (exists) {
      log(`Rule "${rule.name}" already exists, skipping...`, 'warn');
      continue;
    }

    try {
      await createFirewallRule(rule);
      created++;
    } catch (error) {
      if (error.message.includes('not_entitled') || error.message.includes('10012')) {
        log(`⚠️  Rule limit reached for "${rule.name}"`, 'warn');
        log(`   Create this rule manually in the dashboard:`, 'info');
        log(`   Condition: ${rule.condition}`, 'info');
        log(`   Action: ${rule.action}\n`, 'info');
      } else {
        log(`Failed "${rule.name}": ${error.message}`, 'error');
      }
    }
  }

  // Summary
  log('\n' + '='.repeat(50));
  log(`Complete! ${created}/2 remaining rules created.`, 'success');
  log('='.repeat(50));
  
  if (created < 2) {
    log('\n📝 To create remaining rules manually:');
    log('1. Go to: Security → WAF → Firewall rules');
    log('2. Click "Create rule"');
    log('3. Use the conditions shown above\n');
  } else {
    log('\n✅ All rules created successfully!\n');
  }
}

setup().catch(error => {
  log(`Setup failed: ${error.message}`, 'error');
  process.exit(1);
});



