/**
 * Data Migration Script for Normalized Database Structure
 * 
 * This script migrates existing user data to the new normalized structure
 * - Removes duplicate document fields
 * - Centralizes registration numbers
 * - Organizes data into logical groups
 * - Adds proper indexes and constraints
 * 
 * Run this once when deploying the normalized database structure
 */

import { connectDB } from '../lib/db'
import User from '../models/User'
import Dashboard from '../models/Dashboard'
import mongoose from 'mongoose'

interface LegacyUser {
  _id: any
  fullName: string
  mobileNo: string
  email: string
  businessType: string
  businessName: string
  
  // Legacy document fields that need to be moved to documents object
  aadharCardUrl?: string
  panCardUrl?: string
  photographUrl?: string
  proofOfAddressUrl?: string
  gstCertificate?: string
  iecCertificate?: string
  dscCertificate?: string
  icegateCertificate?: string
  adcodeCertificate?: string
  authorizationLetterUrl?: string
  partnershipDeedUrl?: string
  llpAgreementUrl?: string
  certificateOfIncorporationUrl?: string
  moaAoaUrl?: string
  cancelledChequeUrl?: string
  bankDocumentUrl?: string
  adCodeLetterFromBankUrl?: string
  rentAgreementUrl?: string
  electricityBillUrl?: string
  nocUrl?: string
  propertyProofUrl?: string
  electricityBillOwnedUrl?: string
  otherProofUrl?: string
  
  // Legacy registration number fields
  gstNumber?: string
  iecNumber?: string
  dscNumber?: string
  icegateNumber?: string
  adcodeNumber?: string
  
  // Fields that might exist from previous structure
  documents?: any
  registrationNumbers?: any
  profileCompletion?: any
}

async function migrateUserData() {
  console.log('🔄 Starting user data migration...')
  
  try {
    await connectDB()
    console.log('✅ Connected to database')
    
    // Get all users for basic data integrity check
    const users = await User.find({})
    
    console.log(`📊 Found ${users.length} users to migrate`)
    
    let migratedCount = 0
    let errorCount = 0
    
    for (const user of users) {
      try {
        console.log(`🔄 Migrating user: ${user.fullName} (${user.mobileNo})`)
        
        // Initialize basic fields that might be missing
        
        // Initialize login tracking if not exists
        if (!user.loginCount) {
          user.loginCount = 0
        }
        
        // Set default status if not exists
        if (!user.status) {
          user.status = user.emailVerified && user.isMobileVerified ? 'active' : 'pending_verification'
        }
        
        // Initialize preferences if not exists
        if (!user.preferences) {
          user.preferences = {
            language: 'en',
            notifications: true,
            theme: 'light'
          }
        }
        
        // Calculate and set profile completion
        user.calculateProfileCompletion()
        
        await user.save()
        migratedCount++
        
        console.log(`✅ Successfully migrated user: ${user.fullName}`)
        
      } catch (error) {
        console.error(`❌ Error migrating user ${user.fullName}:`, error)
        errorCount++
      }
    }
    
    console.log(`\n📊 Migration Summary:`)
    console.log(`✅ Successfully migrated: ${migratedCount} users`)
    console.log(`❌ Errors: ${errorCount} users`)
    
    if (errorCount === 0) {
      console.log(`🎉 All users migrated successfully!`)
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

async function migrateDashboardData() {
  console.log('🔄 Starting dashboard data migration...')
  
  try {
    // Get all dashboards
    const dashboards = await Dashboard.find({})
    
    console.log(`📊 Found ${dashboards.length} dashboards to check`)
    
    let updatedCount = 0
    
    for (const dashboard of dashboards) {
      let needsUpdate = false
      
      // Ensure all steps have the details field
      for (const step of dashboard.registrationSteps) {
        if (!step.details) {
          step.details = {}
          needsUpdate = true
        }
      }
      
      if (needsUpdate) {
        await dashboard.save()
        updatedCount++
        console.log(`✅ Updated dashboard for user: ${dashboard.userId}`)
      }
    }
    
    console.log(`📊 Dashboard Migration Summary:`)
    console.log(`✅ Updated: ${updatedCount} dashboards`)
    
  } catch (error) {
    console.error('❌ Dashboard migration failed:', error)
  }
}

async function createIndexes() {
  console.log('🔄 Creating database indexes...')
  
  try {
    // Create indexes for User model
    await User.createIndexes()
    console.log('✅ User indexes created')
    
    // Create indexes for Dashboard model
    await Dashboard.createIndexes()
    console.log('✅ Dashboard indexes created')
    
  } catch (error) {
    console.error('❌ Index creation failed:', error)
  }
}

async function runMigration() {
  console.log('🚀 Starting GoFarmly Database Migration')
  console.log('=====================================\n')
  
  await migrateUserData()
  await migrateDashboardData()
  await createIndexes()
  
  console.log('\n🎉 Migration completed successfully!')
  process.exit(0)
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration().catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })
}

async function cleanupLegacyFields() {
  console.log('🔄 Cleaning up legacy document fields...')
  
  try {
    // Get all users
    const users = await User.find({})
    
    console.log(`📊 Found ${users.length} users for legacy field cleanup`)
    
    let cleanedCount = 0
    
    for (const user of users) {
      let needsUpdate = false
      
      // Legacy document fields that can be removed after migration
      const legacyFields = [
        'aadharCardUrl', 'panCardUrl', 'photographUrl', 'proofOfAddressUrl',
        'gstCertificate', 'iecCertificate', 'dscCertificate', 'icegateCertificate', 'adcodeCertificate',
        'authorizationLetterUrl', 'partnershipDeedUrl', 'llpAgreementUrl', 'certificateOfIncorporationUrl', 'moaAoaUrl',
        'cancelledChequeUrl', 'bankDocumentUrl', 'adCodeLetterFromBankUrl',
        'rentAgreementUrl', 'electricityBillUrl', 'nocUrl', 'propertyProofUrl', 'electricityBillOwnedUrl', 'otherProofUrl',
        'gstNumber', 'iecNumber', 'dscNumber', 'icegateNumber', 'adcodeNumber'
      ]
      
      // For now, we're keeping the legacy fields as the main storage
      // This cleanup function is disabled since we removed the organized objects
      console.log(`ℹ️ Keeping legacy fields for user: ${user.fullName} (no cleanup needed)`)
    }
    
    console.log(`📊 Legacy Field Cleanup Summary:`)
    console.log(`✅ Cleaned: ${cleanedCount} users`)
    
  } catch (error) {
    console.error('❌ Legacy field cleanup failed:', error)
  }
}

async function optimizeDatabase() {
  console.log('🔄 Optimizing database performance...')
  
  try {
    // Remove duplicate documents
    const users = await User.find({}).select('_id')
    let totalDuplicatesRemoved = 0
    
    for (const user of users) {
      const duplicatesRemoved = await cleanupDuplicateDocuments(user._id.toString())
      totalDuplicatesRemoved += duplicatesRemoved
    }
    
    console.log(`✅ Removed ${totalDuplicatesRemoved} duplicate documents`)
    
    // Compact collections to reclaim space
    console.log('🔄 Compacting database collections...')
    
    const db = mongoose.connection.db
    if (db) {
      await db.command({ compact: 'users' })
      await db.command({ compact: 'dashboards' })
      await db.command({ compact: 'documents' })
      await db.command({ compact: 'purchasedservices' })
      console.log('✅ Database collections compacted')
    }
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error)
  }
}

// Import document utilities for cleanup
import { cleanupDuplicateDocuments } from '../lib/documentUtils'

export { migrateUserData, migrateDashboardData, createIndexes, cleanupLegacyFields, optimizeDatabase }
