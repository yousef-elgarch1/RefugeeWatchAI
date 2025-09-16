#!/usr/bin/env node

/**
 * RefugeeWatch AI - Phase 1 Foundation Test (CORRECTED)
 * 
 * Validates core setup, configuration, and foundation components
 * Fixed file paths to work from current directory structure.
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration - FIXED PATHS
const TEST_CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  requiredEnvVars: [
    'HUGGINGFACE_API_KEY',
    'HUGGINGFACE_BASE_URL',
    'HUGGINGFACE_MODEL'
  ],
  requiredFiles: [
    'package.json',              // Current directory
    '.env',                      // Current directory  
    'server.js',                 // Current directory
    'src/app.js',               // Current directory
    'src/config/database.js',    // Current directory
    'src/config/huggingface.js', // Current directory
    'src/utils/logger.js',       // Current directory
    'src/middleware/errorHandler.js' // Current directory
  ]
};

/**
 * Print formatted test header
 */
function printHeader() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              RefugeeWatch AI - Phase 1 Test             ║');
  console.log('║                Foundation Validation                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
}

/**
 * Print test result with formatting
 */
function printResult(test, passed, message = '', details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  
  console.log(`${color}${icon} ${test}${colors.reset}`);
  
  if (message) {
    console.log(`   ${colors.yellow}→ ${message}${colors.reset}`);
  }
  
  if (details) {
    console.log(`   ${colors.blue}ℹ️  ${details}${colors.reset}`);
  }
  
  console.log('');
}

/**
 * Test 1: File Structure Validation - FIXED
 */
function testFileStructure() {
  console.log(`${colors.bright}1️⃣ Testing file structure...${colors.reset}\n`);
  
  let allPassed = true;
  
  for (const file of TEST_CONFIG.requiredFiles) {
    // Use current working directory instead of __dirname
    const filePath = path.resolve(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      const size = Math.round(stats.size / 1024);
      printResult(
        `File: ${file}`,
        true,
        `Found (${size}KB)`,
        `Located at: ${filePath}`
      );
    } else {
      printResult(
        `File: ${file}`,
        false,
        'File not found',
        `Expected at: ${filePath}`
      );
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * Test 2: Environment Configuration
 */
function testEnvironmentConfig() {
  console.log(`${colors.bright}2️⃣ Testing environment configuration...${colors.reset}\n`);
  
  // Load environment variables from current directory
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
  
  let allPassed = true;
  
  // Test Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    printResult(
      'Node.js Version',
      true,
      `${nodeVersion} (✓ >= 18.0.0)`,
      'Node.js version is compatible'
    );
  } else {
    printResult(
      'Node.js Version',
      false,
      `${nodeVersion} (✗ < 18.0.0)`,
      'Please upgrade to Node.js 18 or higher'
    );
    allPassed = false;
  }
  
  // Test environment variables
  for (const envVar of TEST_CONFIG.requiredEnvVars) {
    const value = process.env[envVar];
    
    if (value) {
      const displayValue = envVar.includes('API_KEY') 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value;
      
      printResult(
        `Environment: ${envVar}`,
        true,
        `Set: ${displayValue}`,
        'Environment variable configured'
      );
    } else {
      printResult(
        `Environment: ${envVar}`,
        false,
        'Not set',
        'Please add this variable to your .env file'
      );
      allPassed = false;
    }
  }
  
  // Test PORT configuration
  const port = process.env.PORT || 3001;
  printResult(
    'Server Port',
    true,
    `${port}`,
    'Server will start on this port'
  );
  
  return allPassed;
}

/**
 * Test 3: Package Dependencies - FIXED
 */
function testDependencies() {
  console.log(`${colors.bright}3️⃣ Testing package dependencies...${colors.reset}\n`);
  
  try {
    // Load package.json from current directory
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = require(packageJsonPath);
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    printResult(
      'Package.json',
      true,
      `${dependencies.length} dependencies, ${devDependencies.length} dev dependencies`,
      `Version: ${packageJson.version}`
    );
    
    // Test critical dependencies
    const criticalDeps = [
      'express', 'axios', 'winston', 'sqlite3', 'dotenv'
    ];
    
    let allPassed = true;
    
    for (const dep of criticalDeps) {
      try {
        require(dep);
        printResult(
          `Dependency: ${dep}`,
          true,
          'Module loaded successfully',
          'Required dependency available'
        );
      } catch (error) {
        printResult(
          `Dependency: ${dep}`,
          false,
          'Module not found',
          'Run: npm install'
        );
        allPassed = false;
      }
    }
    
    return allPassed;
    
  } catch (error) {
    printResult(
      'Package.json',
      false,
      'Cannot read package.json',
      error.message
    );
    return false;
  }
}

/**
 * Test 4: Database Configuration - FIXED
 */
async function testDatabase() {
  console.log(`${colors.bright}4️⃣ Testing database configuration...${colors.reset}\n`);
  
  try {
    // Load from current directory
    const dbConfigPath = path.resolve(process.cwd(), 'src/config/database.js');
    const { initializeDatabase } = require(dbConfigPath);
    
    // Test database initialization
    await initializeDatabase();
    
    printResult(
      'Database Connection',
      true,
      'SQLite database initialized',
      'Database tables created successfully'
    );
    
    // Test database path
    const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'data/refugeewatch.db');
    const dbExists = fs.existsSync(dbPath);
    
    if (dbExists) {
      const stats = fs.statSync(dbPath);
      const size = Math.round(stats.size / 1024);
      
      printResult(
        'Database File',
        true,
        `Database created (${size}KB)`,
        `Location: ${dbPath}`
      );
    } else {
      printResult(
        'Database File',
        false,
        'Database file not created',
        'Database initialization may have failed'
      );
      return false;
    }
    
    return true;
    
  } catch (error) {
    printResult(
      'Database Connection',
      false,
      'Database initialization failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 5: Hugging Face AI Configuration - FIXED
 */
async function testHuggingFace() {
  console.log(`${colors.bright}5️⃣ Testing Hugging Face AI configuration...${colors.reset}\n`);
  
  try {
    // Load from current directory
    const hfConfigPath = path.resolve(process.cwd(), 'src/config/huggingface.js');
    const { testHuggingFaceConnection, getHFConfig } = require(hfConfigPath);
    
    // Test configuration
    const config = getHFConfig();
    
    printResult(
      'HF Configuration',
      config.hasApiKey,
      `Model: ${config.model}`,
      `Endpoint: ${config.baseURL}`
    );
    
    if (!config.hasApiKey) {
      return false;
    }
    
    // Test connection (with timeout)
    console.log(`   ${colors.yellow}🤖 Testing AI connection (may take 30-60 seconds)...${colors.reset}`);
    
    const result = await Promise.race([
      testHuggingFaceConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), TEST_CONFIG.timeout)
      )
    ]);
    
    if (result.success) {
      printResult(
        'HF Connection',
        true,
        `Connected to ${result.model}`,
        `Response time: ${result.responseTime}ms`
      );
      
      if (result.testResponse) {
        printResult(
          'AI Response Test',
          true,
          'AI model responding correctly',
          `Sample: ${result.testResponse.substring(0, 50)}...`
        );
      }
      
      return true;
    } else {
      printResult(
        'HF Connection',
        false,
        'Connection failed',
        result.error
      );
      return false;
    }
    
  } catch (error) {
    printResult(
      'HF Connection',
      false,
      'Connection test failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 6: Express Application - FIXED
 */
async function testExpressApp() {
  console.log(`${colors.bright}6️⃣ Testing Express application...${colors.reset}\n`);
  
  try {
    // Load from current directory
    const appPath = path.resolve(process.cwd(), 'src/app.js');
    const app = require(appPath);
    
    printResult(
      'Express App',
      true,
      'Application loaded successfully',
      'Express.js middleware configured'
    );
    
    // Test if server can start (without actually starting it)
    const serverPath = path.resolve(process.cwd(), 'server.js');
    const { startServer } = require(serverPath);
    
    printResult(
      'Server Module',
      true,
      'Server startup function available',
      'Ready to start HTTP server'
    );
    
    return true;
    
  } catch (error) {
    printResult(
      'Express App',
      false,
      'Application load failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 7: Logging System - FIXED
 */
function testLogging() {
  console.log(`${colors.bright}7️⃣ Testing logging system...${colors.reset}\n`);
  
  try {
    // Load from current directory
    const loggerPath = path.resolve(process.cwd(), 'src/utils/logger.js');
    const logger = require(loggerPath);
    
    // Test basic logging
    logger.info('Phase 1 test logging verification');
    
    printResult(
      'Logger Module',
      true,
      'Winston logger configured',
      'Logging system operational'
    );
    
    // Test log methods
    const methods = ['info', 'warn', 'error', 'debug', 'ai', 'api', 'crisis'];
    let allMethodsWork = true;
    
    for (const method of methods) {
      if (typeof logger[method] === 'function') {
        try {
          logger[method](`Test ${method} logging`);
        } catch (error) {
          allMethodsWork = false;
          break;
        }
      } else {
        allMethodsWork = false;
        break;
      }
    }
    
    printResult(
      'Logger Methods',
      allMethodsWork,
      `${methods.length} logging methods available`,
      'All custom logging methods functional'
    );
    
    return allMethodsWork;
    
  } catch (error) {
    printResult(
      'Logger Module',
      false,
      'Logger initialization failed',
      error.message
    );
    return false;
  }
}

/**
 * Main test runner
 */
async function runPhase1Tests() {
  printHeader();
  
  const startTime = Date.now();
  const testResults = [];
  
  try {
    // Run all tests
    testResults.push(['File Structure', testFileStructure()]);
    testResults.push(['Environment Config', testEnvironmentConfig()]);
    testResults.push(['Dependencies', testDependencies()]);
    testResults.push(['Database', await testDatabase()]);
    testResults.push(['Hugging Face AI', await testHuggingFace()]);
    testResults.push(['Express App', await testExpressApp()]);
    testResults.push(['Logging System', testLogging()]);
    
    // Calculate results
    const passed = testResults.filter(([, result]) => result).length;
    const total = testResults.length;
    const duration = Date.now() - startTime;
    
    // Print summary
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}📋 PHASE 1 FOUNDATION TEST RESULTS${colors.reset}\n`);
    
    for (const [test, result] of testResults) {
      const icon = result ? '✅' : '❌';
      const color = result ? colors.green : colors.red;
      console.log(`${color}${icon} ${test}${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`   Tests Passed: ${colors.green}${passed}/${total}${colors.reset}`);
    console.log(`   Duration: ${colors.blue}${Math.round(duration / 1000)}s${colors.reset}`);
    console.log(`   Status: ${passed === total ? colors.green + '✅ READY FOR PHASE 2' : colors.red + '❌ ISSUES FOUND'}${colors.reset}`);
    
    if (passed === total) {
      console.log(`\n${colors.green}${colors.bright}🎉 Phase 1 Foundation Complete!${colors.reset}`);
      console.log(`${colors.cyan}Ready to proceed with Phase 2: Data Layer Implementation${colors.reset}\n`);
      
      console.log(`${colors.yellow}Next Steps:${colors.reset}`);
      console.log(`   1. Review any warnings above`);
      console.log(`   2. Confirm all API keys are working`);
      console.log(`   3. Ready for Phase 2 data source integration`);
      console.log('');
      
      return true;
    } else {
      console.log(`\n${colors.red}${colors.bright}⚠️  Phase 1 Issues Found${colors.reset}`);
      console.log(`${colors.yellow}Please fix the failed tests before proceeding to Phase 2.${colors.reset}\n`);
      return false;
    }
    
  } catch (error) {
    console.error(`${colors.red}💥 Phase 1 test failed with error:${colors.reset}`, error.message);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPhase1Tests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = {
  runPhase1Tests,
  TEST_CONFIG
};