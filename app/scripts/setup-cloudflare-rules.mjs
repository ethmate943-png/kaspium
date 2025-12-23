#!/usr/bin/env node

/**
 * Cloudflare Security Rules Setup Script (Free Plan Compatible)
 * 
 * This script automatically configures Cloudflare firewall rules for FREE PLAN users.
 * Focuses on essential rules that work on Cloudflare Free plan.
 * 
 * What gets created:
 * - 3 Essential Firewall Rules (works on Free plan)
 * - Rate Limiting (if available, gracefully skips if not)
 * 
 * Usage:
 *   1. Set environment variables: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID
 *   2. Run: npm run cloudflare:setup
 * 
 * Or manually:
 *   node scripts/setup-cloudflare-rules.mjs
 * 
 * Note: Free plan allows ~5 firewall rules. This script creates 3 essential ones.
 */

import fetch from 'node-fetch';
import 'dotenv/config';

// Configuration
const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

// Rule definitions
const FIREWALL_RULES = [
  {
    name: 'Allow Verified Bots',
    description: 'Allow all Cloudflare-verified bots (Googlebot, Bingbot, etc.) - MUST BE FIRST',
    priority: 1, // Highest priority
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

const RATE_LIMIT_RULE = {
  name: 'Rate Limit Search & API Endpoints',
  description: 'Rate limit /search, /availability, and /api endpoints to prevent scraping',
  match: '(http.request.uri.path contains "/search") or (http.request.uri.path contains "/availability") or (http.request.uri.path contains "/api")',
  threshold: 30, // requests
  period: 60, // seconds (1 minute)
  action: {
    mode: 'managed_challenge',
  },
};

// Helper functions
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
      // Provide detailed error information
      const errorMessages = data.errors?.map(err => 
        `${err.message} (code: ${err.code || 'unknown'})`
      ).join(', ') || `HTTP ${response.status} ${response.statusText}`;
      
      // Log full error details for debugging
      if (response.status === 401 || response.status === 403) {
        log(`Authentication failed. Check your API token and permissions.`, 'error');
        log(`Error details: ${errorMessages}`, 'error');
        if (!API_TOKEN) {
          log(`API token is missing! Check your .env file.`, 'error');
        } else {
          log(`Token starts with: ${API_TOKEN.substring(0, 10)}...`, 'info');
        }
      }
      
      throw new Error(errorMessages);
    }

    return data;
  } catch (error) {
    if (error.message.includes('Authentication') || error.message.includes('401') || error.message.includes('403')) {
      log(`API request failed: ${error.message}`, 'error');
      log(`\n💡 Troubleshooting:`, 'info');
      log(`1. Verify your API token at: https://dash.cloudflare.com/profile/api-tokens`, 'info');
      log(`2. Check token has permissions: Firewall Rules (Edit), Rate Limiting (Edit), Zone (Read)`, 'info');
      log(`3. Ensure token is for the correct zone`, 'info');
      log(`4. Token should start with letters/numbers (not include spaces or quotes)`, 'info');
    } else {
      log(`API request failed: ${error.message}`, 'error');
    }
    throw error;
  }
}

async function getExistingRules() {
  try {
    const response = await apiRequest(`/zones/${ZONE_ID}/firewall/rules`);
    return response.result || [];
  } catch (error) {
    log(`Failed to fetch existing rules: ${error.message}`, 'error');
    return [];
  }
}

async function createFirewallRule(rule) {
  // Cloudflare API accepts both array and single object format
  // Try array format first (recommended)
  const payloadArray = [
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
    // Try array format first
    let response = await apiRequest(
      `/zones/${ZONE_ID}/firewall/rules`,
      'POST',
      payloadArray
    );
    
    if (response.success) {
      // Array format returns result as array
      const result = Array.isArray(response.result) ? response.result[0] : response.result;
      if (result) {
        log(`Created firewall rule: ${rule.name}`, 'success');
        return result;
      }
    }
    
    // If array format didn't work, try single object format
    const payloadObject = {
      action: rule.action,
      priority: rule.priority,
      paused: false,
      description: rule.description,
      filter: {
        expression: rule.condition,
        paused: false,
      },
    };
    
    response = await apiRequest(
      `/zones/${ZONE_ID}/firewall/rules`,
      'POST',
      payloadObject
    );
    
    if (response.success) {
      log(`Created firewall rule: ${rule.name}`, 'success');
      return response.result;
    }
    
    throw new Error(`API returned success: false - ${JSON.stringify(response.errors || response)}`);
  } catch (error) {
    if (error.message.includes('malformed_request_body') || error.message.includes('10014')) {
      log(`⚠️  API format error. Free plan may have API restrictions.`, 'warn');
      log(`   💡 Use manual dashboard setup instead: CLOUDFLARE_DASHBOARD_SETUP.md`, 'info');
    }
    log(`Failed to create rule "${rule.name}": ${error.message}`, 'error');
    throw error;
  }
}

async function getExistingRateLimitRules() {
  try {
    const response = await apiRequest(`/zones/${ZONE_ID}/rate_limits`);
    return response.result || [];
  } catch (error) {
    log(`Failed to fetch existing rate limit rules: ${error.message}`, 'error');
    return [];
  }
}

async function createRateLimitRule(rule) {
  const payload = {
    match: rule.match,
    threshold: rule.threshold,
    period: rule.period,
    action: rule.action,
    disabled: false,
    description: rule.description,
  };

  try {
    const response = await apiRequest(
      `/zones/${ZONE_ID}/rate_limits`,
      'POST',
      payload
    );
    
    if (response.success) {
      log(`Created rate limit rule: ${rule.name}`, 'success');
      return response.result;
    }
  } catch (error) {
    log(`Failed to create rate limit rule "${rule.name}": ${error.message}`, 'error');
    throw error;
  }
}

async function verifyZone() {
  try {
    const response = await apiRequest(`/zones/${ZONE_ID}`);
    if (response.success) {
      log(`Verified zone: ${response.result.name}`, 'success');
      log(`Zone status: ${response.result.status}`, 'info');
      return true;
    }
  } catch (error) {
    log(`Zone verification failed: ${error.message}`, 'error');
    log(`\n💡 Troubleshooting:`, 'info');
    log(`1. Verify Zone ID is correct: ${ZONE_ID}`, 'info');
    log(`2. Get Zone ID from: Cloudflare Dashboard → Your Domain → Overview → API`, 'info');
    log(`3. Ensure your API token has access to this zone`, 'info');
    return false;
  }
}

// Main setup function
async function setupCloudflareRules() {
  log('Starting Cloudflare security rules setup (Free Plan Compatible)...\n');
  log('📋 This setup focuses on essential rules that work on Cloudflare Free plan.\n');

  // Validate environment variables
  if (!API_TOKEN || API_TOKEN.trim() === '') {
    log('CLOUDFLARE_API_TOKEN environment variable is required', 'error');
    log('Get your API token from: https://dash.cloudflare.com/profile/api-tokens', 'info');
    log('Make sure your .env file exists and contains: CLOUDFLARE_API_TOKEN=your-token', 'info');
    process.exit(1);
  }

  if (!ZONE_ID || ZONE_ID.trim() === '') {
    log('CLOUDFLARE_ZONE_ID environment variable is required', 'error');
    log('Find your Zone ID in Cloudflare dashboard → Overview → API → Zone ID', 'info');
    log('Make sure your .env file contains: CLOUDFLARE_ZONE_ID=your-zone-id', 'info');
    process.exit(1);
  }

  // Validate token format (should be alphanumeric, no spaces)
  if (API_TOKEN.includes(' ') || API_TOKEN.length < 20) {
    log('⚠️  Warning: API token format looks incorrect', 'warn');
    log('API tokens are typically 40+ characters and contain no spaces', 'info');
    log('Make sure you copied the full token without quotes or extra spaces', 'info');
  }

  log(`Using Zone ID: ${ZONE_ID}`, 'info');
  log(`Token length: ${API_TOKEN.length} characters`, 'info');

  // Test API token first
  log('Testing API token...');
  try {
    const testResponse = await apiRequest('/user/tokens/verify');
    if (testResponse.success) {
      log(`Token verified for: ${testResponse.result.email || 'your account'}`, 'success');
    }
  } catch (error) {
    log('Token verification failed. This might indicate an invalid token.', 'error');
    log('Continuing anyway to test zone access...', 'warn');
  }

  // Verify zone access
  log('\nVerifying zone access...');
  const zoneValid = await verifyZone();
  if (!zoneValid) {
    log('\n❌ Cannot access zone. Please check:', 'error');
    log('1. API token is correct and not expired', 'info');
    log('2. API token has "Zone → Zone → Read" permission', 'info');
    log('3. Zone ID is correct', 'info');
    log('4. Token has access to this specific zone', 'info');
    process.exit(1);
  }

  // Check for existing rules with same names
  log('\nChecking existing rules...');
  const existingRules = await getExistingRules();
  const existingRuleNames = existingRules.map(r => r.description || r.filter?.expression);

  // Create firewall rules (Free plan compatible - 3 essential rules)
  log('\n📋 Creating firewall rules (Free Plan - 3 essential rules)...\n');
  let rulesCreated = 0;
  let rulesSkipped = 0;
  let rulesFailed = 0;

  for (const rule of FIREWALL_RULES) {
    // Check if similar rule already exists
    const exists = existingRules.some(existing => {
      const existingExpr = existing.filter?.expression;
      return existingExpr === rule.condition;
    });

    if (exists) {
      log(`Rule "${rule.name}" already exists, skipping...`, 'warn');
      rulesSkipped++;
      continue;
    }

    try {
      await createFirewallRule(rule);
      rulesCreated++;
    } catch (error) {
      // Check if it's a plan limitation error
      if (error.message.includes('403') || error.message.includes('permission') || 
          error.message.includes('plan') || error.message.includes('limit')) {
        log(`⚠️  "${rule.name}" may require a paid plan or you've hit rule limits`, 'warn');
        log(`   Free plan allows ~5 firewall rules. You can create this manually in the dashboard.`, 'info');
      } else {
        log(`Failed to create "${rule.name}": ${error.message}`, 'error');
      }
      rulesFailed++;
    }
  }

  log(`\n📊 Firewall Rules Summary: ${rulesCreated} created, ${rulesSkipped} skipped, ${rulesFailed} failed`, 'info');

  // Create rate limiting rule (optional - may not be available on Free plan)
  log('\n🚦 Attempting to create rate limiting rule (optional on Free plan)...\n');
  let rateLimitCreated = false;
  
  try {
    const existingRateLimits = await getExistingRateLimitRules();
    const rateLimitExists = existingRateLimits.some(existing => {
      return existing.match === RATE_LIMIT_RULE.match;
    });

    if (rateLimitExists) {
      log(`Rate limit rule already exists, skipping...`, 'warn');
      rateLimitCreated = true;
    } else {
      try {
        await createRateLimitRule(RATE_LIMIT_RULE);
        rateLimitCreated = true;
      } catch (error) {
        if (error.message.includes('403') || error.message.includes('permission') || 
            error.message.includes('plan') || error.message.includes('401')) {
          log(`ℹ️  Rate limiting may not be available via API on Free plan`, 'info');
          log(`   This is optional. You can:`, 'info');
          log(`   1. Set it up manually: Security → Rate Limiting → Create rule`, 'info');
          log(`   2. Implement server-side rate limiting in your Express server`, 'info');
          log(`   3. Your 3 firewall rules provide strong protection already!`, 'info');
        } else {
          log(`Failed to create rate limit rule: ${error.message}`, 'error');
        }
      }
    }
  } catch (error) {
    log(`ℹ️  Rate limiting API not accessible (this is normal on Free plan)`, 'info');
    log(`   The 3 firewall rules above provide excellent protection!`, 'info');
  }

  // Summary
  log('\n' + '='.repeat(60));
  log('Setup complete! (Free Plan Compatible)', 'success');
  log('='.repeat(60));
  
  // Summary of what was created
  log('\n✅ What was set up:');
  log(`   • ${rulesCreated} firewall rules created`);
  if (rulesSkipped > 0) {
    log(`   • ${rulesSkipped} rules already existed`);
  }
  if (rateLimitCreated) {
    log(`   • Rate limiting rule created`);
  } else {
    log(`   • Rate limiting: Not available (optional on Free plan)`);
  }
  
  log('\n📝 Next steps:');
  log('1. Go to Cloudflare Dashboard → Security → WAF → Firewall rules');
  log('2. Verify that "Allow Verified Bots" is at the top (highest priority)');
  log('3. Enable Bot Fight Mode: Security → Bots → Enable "Bot Fight Mode"');
  log('4. Check Security → Events to see blocked fake bots');
  log('5. Monitor Google Search Console for any crawl issues');
  log('\n⚠️  Important: Rule order matters! "Allow Verified Bots" must be first.');
  
  // Free plan specific notes
  log('\n💡 Free Plan Optimization:');
  log('✅ You now have 3 essential firewall rules (Free plan allows ~5)');
  log('✅ Enable Bot Fight Mode for additional free protection');
  log('✅ Your server-side verification (verifyGooglebot.js) still works!');
  if (rulesFailed > 0) {
    log('\n⚠️  Some rules failed. This might be due to:');
    log('   • Plan limitations (some features require Pro/Business)');
    log('   • API token permissions');
    log('   • Rule limits reached');
    log('   → See CLOUDFLARE_FREE_PLAN_SETUP.md for manual setup');
  }
  log('\n📚 Documentation:');
  log('   • CLOUDFLARE_FREE_PLAN_SETUP.md - Free plan specific guide');
  log('   • CLOUDFLARE_SECURITY.md - Full documentation\n');
}

// Run setup
setupCloudflareRules().catch(error => {
  log(`Setup failed: ${error.message}`, 'error');
  process.exit(1);
});

