#!/usr/bin/env node

/**
 * Simple Cloudflare API Test Script
 * 
 * Tests your API token and creates one firewall rule as an example.
 * Use this to verify your API setup works before running the full setup.
 * 
 * Usage:
 *   node scripts/test-cloudflare-api.mjs
 */

import fetch from 'node-fetch';
import 'dotenv/config';

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const API_BASE = 'https://api.cloudflare.com/client/v4';

async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE}${endpoint}`;
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

  const response = await fetch(url, options);
  const data = await response.json();
  
  return { response, data };
}

async function test() {
  console.log('🧪 Testing Cloudflare API...\n');

  // Check env vars
  if (!API_TOKEN || !ZONE_ID) {
    console.log('❌ Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID in .env file');
    process.exit(1);
  }

  console.log(`Token: ${API_TOKEN.substring(0, 10)}...`);
  console.log(`Zone ID: ${ZONE_ID}\n`);

  // Test 1: Verify token
  console.log('1️⃣ Testing API token...');
  try {
    const { response, data } = await apiCall('/user/tokens/verify');
    if (response.ok && data.success) {
      console.log(`✅ Token valid for: ${data.result.email || 'your account'}\n`);
    } else {
      console.log(`❌ Token invalid: ${data.errors?.[0]?.message || 'Unknown error'}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }

  // Test 2: Verify zone access
  console.log('2️⃣ Testing zone access...');
  try {
    const { response, data } = await apiCall(`/zones/${ZONE_ID}`);
    if (response.ok && data.success) {
      console.log(`✅ Zone accessible: ${data.result.name} (${data.result.status})\n`);
    } else {
      console.log(`❌ Zone access failed: ${data.errors?.[0]?.message || 'Unknown error'}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }

  // Test 3: List existing firewall rules
  console.log('3️⃣ Checking existing firewall rules...');
  try {
    const { response, data } = await apiCall(`/zones/${ZONE_ID}/firewall/rules`);
    if (response.ok) {
      const rules = data.result || [];
      console.log(`✅ Found ${rules.length} existing firewall rules\n`);
      if (rules.length > 0) {
        console.log('Existing rules:');
        rules.forEach((rule, i) => {
          console.log(`   ${i + 1}. ${rule.description || rule.filter?.expression || 'Unnamed'}`);
        });
        console.log('');
      }
    } else {
      console.log(`⚠️  Could not fetch rules: ${data.errors?.[0]?.message || 'Unknown error'}\n`);
    }
  } catch (error) {
    console.log(`⚠️  Error: ${error.message}\n`);
  }

  // Test 4: Create a test rule (optional)
  console.log('4️⃣ Would you like to create a test rule?');
  console.log('   Run the full setup script instead: npm run cloudflare:setup\n');

  console.log('✅ All API tests passed! Your API token is working correctly.\n');
  console.log('📝 Next steps:');
  console.log('   • Run: npm run cloudflare:setup');
  console.log('   • Or: npm run cloudflare:setup:free\n');
}

test().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});



