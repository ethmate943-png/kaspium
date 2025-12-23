#!/usr/bin/env node

/**
 * Test script to simulate a fake Googlebot request
 * This helps verify that your Cloudflare rules are blocking fake bots
 * 
 * Usage: node scripts/test-fake-bot.mjs
 */

import fetch from 'node-fetch';
import 'dotenv/config';

const DOMAIN = process.env.CLOUDFLARE_DOMAIN || 'walletkaspanet.com';

async function testFakeBot() {
  console.log('🧪 Testing Fake Bot Detection\n');
  console.log(`Testing domain: ${DOMAIN}\n`);

  // Test 1: Fake Googlebot (should be blocked)
  console.log('1️⃣ Testing Fake Googlebot (should be blocked)...');
  try {
    const response = await fetch(`https://${DOMAIN}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    
    if (response.status === 403 || response.status === 1020) {
      console.log('✅ Fake Googlebot was BLOCKED (correct behavior!)\n');
    } else {
      console.log(`⚠️  Fake Googlebot got status: ${response.status}`);
      console.log('   This might mean the rule isn\'t working yet, or it\'s being challenged\n');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 2: Normal browser (should work)
  console.log('2️⃣ Testing Normal Browser (should work)...');
  try {
    const response = await fetch(`https://${DOMAIN}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      console.log('✅ Normal browser request worked (correct behavior!)\n');
    } else {
      console.log(`⚠️  Got status: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('📝 Note: Real Googlebot uses verified IPs, so this test simulates a fake bot.');
  console.log('   Check Cloudflare Dashboard → Security → Events to see actual blocks.\n');
}

testFakeBot().catch(console.error);



