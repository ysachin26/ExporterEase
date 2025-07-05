#!/usr/bin/env npx tsx

/**
 * Complete Database Migration Runner
 * 
 * This script runs the complete migration process:
 * 1. Migrate user data to new normalized structure
 * 2. Migrate dashboard data
 * 3. Create optimized indexes
 * 4. Clean up legacy fields (optional)
 * 5. Optimize database performance (optional)
 */

import { 
  migrateUserData, 
  migrateDashboardData, 
  createIndexes, 
  cleanupLegacyFields, 
  optimizeDatabase 
} from './migrate-user-data'
import { migrateLegacyDocuments } from '../lib/documentUtils'
import { connectDB, disconnectDB } from '../lib/db'
import User from '../models/User'

interface MigrationOptions {
  dryRun?: boolean
  cleanupLegacy?: boolean
  optimize?: boolean
  migrateDocuments?: boolean
}

async function runCompleteMigration(options: MigrationOptions = {}) {
  const { dryRun = false, cleanupLegacy = false, optimize = false, migrateDocuments = false } = options
  
  console.log('🚀 Starting Complete GoFarmly Database Migration')
  console.log('================================================')
  console.log(`📋 Options:`)
  console.log(`   Dry Run: ${dryRun ? '✅' : '❌'}`)
  console.log(`   Cleanup Legacy: ${cleanupLegacy ? '✅' : '❌'}`)
  console.log(`   Optimize: ${optimize ? '✅' : '❌'}`)
  console.log(`   Migrate Documents: ${migrateDocuments ? '✅' : '❌'}`)
  console.log('')
  
  try {
    await connectDB()
    console.log('✅ Connected to database')
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made')
      await performDryRun()
      return
    }
    
    // Step 1: Basic data structure migration
    console.log('\n📝 Step 1: Migrating user data structure...')
    await migrateUserData()
    
    // Step 2: Dashboard data migration
    console.log('\n📝 Step 2: Migrating dashboard data...')
    await migrateDashboardData()
    
    // Step 3: Document migration to new Document model
    if (migrateDocuments) {
      console.log('\n📝 Step 3: Migrating documents to new model...')
      await migrateDocumentsToNewModel()
    }
    
    // Step 4: Create optimized indexes
    console.log('\n📝 Step 4: Creating database indexes...')
    await createIndexes()
    
    // Step 5: Cleanup legacy fields (optional)
    if (cleanupLegacy) {
      console.log('\n📝 Step 5: Cleaning up legacy fields...')
      await cleanupLegacyFields()
    }
    
    // Step 6: Database optimization (optional)
    if (optimize) {
      console.log('\n📝 Step 6: Optimizing database...')
      await optimizeDatabase()
    }
    
    console.log('\n🎉 Migration completed successfully!')
    await generateMigrationReport()
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await disconnectDB()
    console.log('🔌 Disconnected from database')
  }
}

async function performDryRun() {
  console.log('\n🔍 Analyzing current database state...')
  
  try {
    // Count users needing migration
    const usersNeedingMigration = await User.countDocuments({
      $or: [
        { documents: { $exists: false } },
        { registrationNumbers: { $exists: false } },
        { profileCompletion: { $exists: false } },
        { preferences: { $exists: false } }
      ]
    })
    
    const totalUsers = await User.countDocuments({})
    
    // Check legacy fields
    const usersWithLegacyFields = await User.countDocuments({
      $or: [
        { aadharCardUrl: { $exists: true } },
        { panCardUrl: { $exists: true } },
        { gstNumber: { $exists: true } }
      ]
    })
    
    console.log('\n📊 Dry Run Analysis:')
    console.log(`   Total Users: ${totalUsers}`)
    console.log(`   Users Needing Migration: ${usersNeedingMigration}`)
    console.log(`   Users with Legacy Fields: ${usersWithLegacyFields}`)
    
    if (usersNeedingMigration === 0) {
      console.log('✅ No migration needed - database is up to date!')
    } else {
      console.log(`⚠️  ${usersNeedingMigration} users need migration`)
    }
    
  } catch (error) {
    console.error('❌ Dry run analysis failed:', error)
  }
}

async function migrateDocumentsToNewModel() {
  console.log('🔄 Migrating documents to new Document model...')
  
  try {
    const users = await User.find({}).select('_id fullName')
    let totalMigrated = 0
    
    for (const user of users) {
      const migratedCount = await migrateLegacyDocuments(user._id.toString())
      if (migratedCount > 0) {
        console.log(`✅ Migrated ${migratedCount} documents for user: ${user.fullName}`)
        totalMigrated += migratedCount
      }
    }
    
    console.log(`📊 Document Migration Summary:`)
    console.log(`✅ Total documents migrated: ${totalMigrated}`)
    
  } catch (error) {
    console.error('❌ Document migration failed:', error)
  }
}

async function generateMigrationReport() {
  console.log('\n📊 Generating Migration Report...')
  console.log('==================================')
  
  try {
    const totalUsers = await User.countDocuments({})
    const migratedUsers = await User.countDocuments({
      documents: { $exists: true },
      registrationNumbers: { $exists: true },
      profileCompletion: { $exists: true }
    })
    
    const usersWithLegacyFields = await User.countDocuments({
      $or: [
        { aadharCardUrl: { $exists: true } },
        { panCardUrl: { $exists: true } }
      ]
    })
    
    console.log(`📈 Migration Report:`)
    console.log(`   Total Users: ${totalUsers}`)
    console.log(`   Successfully Migrated: ${migratedUsers}`)
    console.log(`   Migration Success Rate: ${((migratedUsers / totalUsers) * 100).toFixed(1)}%`)
    console.log(`   Users with Legacy Fields: ${usersWithLegacyFields}`)
    
    if (migratedUsers === totalUsers && usersWithLegacyFields === 0) {
      console.log('🎯 Perfect! All users migrated and no legacy fields remain.')
    } else if (migratedUsers === totalUsers) {
      console.log('✅ All users migrated successfully. Consider running cleanup to remove legacy fields.')
    } else {
      console.log('⚠️  Some users may need manual review.')
    }
    
  } catch (error) {
    console.error('❌ Failed to generate migration report:', error)
  }
}

// CLI interface
function parseArgs() {
  const args = process.argv.slice(2)
  const options: MigrationOptions = {}
  
  if (args.includes('--dry-run')) options.dryRun = true
  if (args.includes('--cleanup')) options.cleanupLegacy = true
  if (args.includes('--optimize')) options.optimize = true
  if (args.includes('--migrate-docs')) options.migrateDocuments = true
  
  return options
}

function showUsage() {
  console.log(`
GoFarmly Database Migration Tool

Usage: npx tsx scripts/run-migration.ts [options]

Options:
  --dry-run        Analyze database without making changes
  --cleanup        Remove legacy fields after migration (CAREFUL!)
  --optimize       Optimize database performance (remove duplicates, compact)
  --migrate-docs   Migrate documents to new Document model
  
Examples:
  npx tsx scripts/run-migration.ts --dry-run
  npx tsx scripts/run-migration.ts
  npx tsx scripts/run-migration.ts --cleanup --optimize
  npx tsx scripts/run-migration.ts --migrate-docs
`)
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage()
    process.exit(0)
  }
  
  const options = parseArgs()
  await runCompleteMigration(options)
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
}

export { runCompleteMigration }
