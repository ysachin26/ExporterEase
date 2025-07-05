# GoFarmly Database Migration Guide

This document explains the database restructuring changes and how to migrate your existing data to the new normalized structure.

## 🎯 Migration Goals

The database migration aims to:

1. **Remove Data Redundancy**: Eliminate duplicate document fields across models
2. **Improve Organization**: Group related data into logical structures
3. **Enhance Performance**: Add proper indexes and optimize queries
4. **Enable Scalability**: Create a more maintainable and extensible structure
5. **Centralize Document Management**: Introduce a dedicated Document model

## 📊 What Changed

### Before (Legacy Structure)
```typescript
// User Model - Documents scattered across many fields
{
  aadharCardUrl: "url1",
  panCardUrl: "url2", 
  photographUrl: "url3",
  gstCertificate: "url4",
  iecCertificate: "url5",
  // ... 20+ more document fields
  gstNumber: "123",
  iecNumber: "456",
  // ... more registration numbers
}
```

### After (Normalized Structure)
```typescript
// User Model - Organized structure
{
  documents: {
    aadharCard: "url1",
    panCard: "url2",
    photograph: "url3"
    // ... organized by category
  },
  registrationNumbers: {
    gst: "123",
    iec: "456"
    // ... centralized
  },
  profileCompletion: {
    basicDetails: true,
    contactDetails: true,
    percentage: 85
  }
}

// New Document Model - Centralized document management
{
  userId: ObjectId,
  type: "aadharCard",
  category: "profile",
  url: "url1",
  status: "verified",
  metadata: { fileSize, mimeType, ... }
}
```

## 🚀 Running the Migration

### Step 1: Check Current State (Dry Run)
```bash
# Analyze what needs to be migrated without making changes
npm run migrate:dry-run
```

### Step 2: Basic Migration
```bash
# Migrate data structure only
npm run migrate
```

### Step 3: Full Migration (Recommended)
```bash
# Migrate everything including documents and optimization
npm run migrate:full
```

### Step 4: Cleanup Legacy Fields (Optional)
```bash
# Remove old document fields after verifying migration
npm run migrate:cleanup
```

### Step 5: Optimize Database (Optional)
```bash
# Remove duplicates and compact collections
npm run db:optimize
```

## 📋 Migration Scripts Available

| Script | Description | Safety |
|--------|-------------|---------|
| `npm run migrate:dry-run` | Analyze database without changes | ✅ Safe |
| `npm run migrate` | Basic structure migration | ⚠️ Backup first |
| `npm run migrate:full` | Complete migration + optimization | ⚠️ Backup first |
| `npm run migrate:cleanup` | Remove legacy fields | ⚠️ Dangerous |
| `npm run db:optimize` | Performance optimization | ⚠️ Backup first |

## 🔧 Manual Migration (Advanced)

If you need to run specific parts of the migration:

```typescript
import { 
  migrateUserData, 
  migrateDashboardData, 
  createIndexes,
  cleanupLegacyFields,
  optimizeDatabase 
} from './scripts/migrate-user-data'

// Run specific migrations
await migrateUserData()
await createIndexes()
```

## 📈 Benefits After Migration

### 1. Reduced Data Redundancy
- **Before**: Document URLs stored in 25+ fields
- **After**: Documents organized in structured objects + centralized Document model

### 2. Better Performance
- **New Indexes**: Optimized for common queries
- **Compound Indexes**: Multi-field search optimization
- **Text Search**: Full-text search on documents and users

### 3. Improved Organization
- **User Model**: Clean, organized structure
- **Document Model**: Centralized document management with metadata
- **Dashboard Model**: Enhanced with proper relationships

### 4. Enhanced Features
- **Document Versioning**: Track document history and status
- **Profile Completion**: Accurate percentage calculation
- **Registration Progress**: Better tracking across steps
- **Search Capabilities**: Find documents and users efficiently

## 🔍 Verification

After migration, verify the changes:

```bash
# Check migration status
npm run migrate:dry-run

# Should show:
# ✅ No migration needed - database is up to date!
# 📊 Users with Legacy Fields: 0
```

## 🗄️ Database Schema Changes

### New Collections

#### Documents Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  dashboardId: ObjectId,
  type: "aadharCard" | "panCard" | ...,
  category: "profile" | "business" | "registration" | "compliance",
  name: "Aadhar Card",
  url: "https://cloudinary.com/...",
  status: "uploaded" | "verified" | "rejected",
  metadata: {
    fileSize: 1024000,
    mimeType: "image/jpeg",
    originalFilename: "aadhar.jpg",
    uploadSource: "web"
  },
  statusHistory: [...],
  createdAt: Date,
  updatedAt: Date
}
```

### Updated Collections

#### Users Collection
- Added `documents` object (organized document URLs)
- Added `registrationNumbers` object (centralized numbers)
- Added `profileCompletion` tracking
- Added `preferences` for user settings
- Added `status` and login tracking
- Kept legacy fields temporarily for backwards compatibility

#### Dashboards Collection
- Enhanced `registrationSteps` with `details` field
- Improved notification system
- Better progress tracking

## 🔄 Rollback Plan

If you need to rollback:

1. **Before Migration**: Create database backup
2. **During Issues**: Stop migration and restore backup
3. **After Migration**: Legacy fields are preserved until cleanup

```bash
# Create backup before migration
mongodump --db your_database_name --out backup_folder

# Restore if needed
mongorestore backup_folder/your_database_name
```

## 🎛️ Configuration

### Environment Variables
Ensure these are set before migration:
```env
MONGODB_URI=mongodb://localhost:27017/gofarmly
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Memory Requirements
- **Small DB** (< 1000 users): 512MB RAM
- **Medium DB** (1000-10000 users): 1GB RAM  
- **Large DB** (> 10000 users): 2GB+ RAM

## ❓ Troubleshooting

### Common Issues

#### Migration Fails with Memory Error
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 node_modules/.bin/tsx scripts/run-migration.ts
```

#### Some Users Not Migrated
```bash
# Check for specific errors in migration logs
# Run dry-run to see what's pending
npm run migrate:dry-run
```

#### Performance Issues After Migration
```bash
# Run optimization
npm run db:optimize

# Check indexes are created
# Look for slow queries in MongoDB logs
```

### Getting Help

1. **Check Logs**: Look for detailed error messages
2. **Dry Run**: Always run dry-run first to understand impact
3. **Backup**: Always backup before major changes
4. **Step by Step**: Run migration in stages for large databases

## 📚 Additional Resources

- [MongoDB Migration Best Practices](https://docs.mongodb.com/manual/tutorial/migrate-sharded-cluster/)
- [Mongoose Schema Design](https://mongoosejs.com/docs/guide.html)
- [Database Indexing Guide](https://docs.mongodb.com/manual/indexes/)

---

**⚠️ Important**: Always backup your database before running any migration!
