# ImageKit Archive System

## Overview

The ImageKit Archive System automatically moves user images to a secure archive folder when accounts are deleted, ensuring data retention compliance while maintaining organized storage.

## How It Works

### 1. Archive Folder Structure

```
ImageKit Storage:
├── captioncraft_uploads/          # Active user images
│   ├── user123/
│   └── user456/
└── archived_accounts/             # Archived images
    ├── user123/                   # Organized by user ID
    │   └── captioncraft_uploads/
    │       └── archived_1234567890_image_ABC123.jpg
    └── user456/
        └── captioncraft_uploads/
            └── archived_1234567890_image_DEF456.jpg
```

### 2. Archiving Process

When a user deletes their account:

1. **Image Collection**: All user images are identified
2. **Copy to Archive**: Images are copied to `archived_accounts/{userId}/` folder
3. **Original Cleanup**: Original images are deleted from active storage
4. **URL Update**: New archive URLs are stored in `DeletedProfile`
5. **Metadata Tracking**: Archive success/failure statistics are recorded

### 3. Archive Naming Convention

```
archived_{timestamp}_{originalFilename}
Example: archived_1703123456789_image_ABC123.jpg
```

## API Endpoints

### Archive Images During Account Deletion

```typescript
POST /api/user/delete
DELETE /api/user/delete
```

**Response includes:**
```json
{
  "success": true,
  "imagesArchived": {
    "total": 5,
    "successful": 5,
    "failed": 0
  }
}
```

### View Archived Profiles (Admin Only)

```typescript
GET /api/admin/archived-profiles?page=1&limit=10&email=user@example.com
```

**Admin Access:**
- Email must contain "admin" (basic check)
- Returns paginated archived profiles with image metadata

## Database Schema Updates

### DeletedProfile Model

```typescript
interface IDeletedProfile {
  // ... existing fields ...
  postsData: Array<{
    _id: string;
    caption: string;
    image?: string;              // Original image URL
    archivedImageUrl?: string;   // NEW: Archive URL
    createdAt: Date;
  }>;
  archiveMetadata?: {            // NEW: Archive statistics
    totalImages: number;
    successfullyArchived: number;
    failedArchives: number;
    archiveErrors?: Array<{ url: string; error: string }>;
    archivedAt: Date;
  };
}
```

## ImageKit Utilities

### New Functions

```typescript
// Move single image to archive
moveImageToArchive(url: string, userId: string): Promise<ArchiveResult>

// Batch archive multiple images
batchMoveImagesToArchive(urls: string[], userId: string): Promise<BatchArchiveResult>

// Extract path and filename from ImageKit URL
extractImageKitPathAndName(url: string): PathInfo | null
```

### Archive Result Types

```typescript
interface ArchiveResult {
  success: boolean;
  newUrl?: string;      // New archive URL
  error?: string;       // Error message if failed
}

interface BatchArchiveResult {
  success: number;      // Number of successful archives
  failed: number;       // Number of failed archives
  archivedUrls: string[]; // Array of new archive URLs
  errors: Array<{ url: string; error: string }>; // Failed archives with errors
}
```

## Admin Interface

### Archived Profiles Page

**Route:** `/admin/archived-profiles`

**Features:**
- View all archived profiles
- Search by email address
- Pagination support
- Image archive statistics
- Archive success/failure tracking
- Deletion reasons and timestamps

## Benefits

### 1. Data Compliance
- Images are preserved for legal/regulatory requirements
- Organized archive structure for easy retrieval
- Audit trail of all archived content

### 2. Storage Management
- Active storage remains clean and organized
- Archive folder provides long-term storage
- Easy to implement retention policies

### 3. User Experience
- Clear communication about image archiving
- Transparent archive status in deletion process
- Professional data handling approach

## Configuration

### Environment Variables

```env
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
```

### Archive Folder Name

```typescript
// In src/lib/imagekit-utils.ts
const ARCHIVE_FOLDER = 'archived_accounts'; // Customizable
```

## Error Handling

### Archive Failures

- Failed archives are logged with detailed error messages
- Original images remain in place if archiving fails
- Database records include failure statistics
- Admin interface shows archive success/failure rates

### Fallback Behavior

- If ImageKit operations fail, account deletion continues
- Images remain accessible until manually cleaned up
- Error logs provide debugging information

## Monitoring & Maintenance

### Archive Statistics

Track archive success rates:
- Total images processed
- Successfully archived count
- Failed archive count
- Error details for failed archives

### Cleanup Options

```typescript
// Optional: Auto-delete archived profiles after X years
DeletedProfileSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years
```

### Admin Monitoring

- Regular review of archive statistics
- Monitor failed archives for system issues
- Track storage usage in archive folder
- Implement retention policies as needed

## Security Considerations

### Access Control
- Archive API endpoints require admin authentication
- Archive folder URLs are not publicly accessible
- User data is properly sanitized before archiving

### Data Privacy
- Sensitive user information is excluded from archives
- Archive metadata includes audit trail
- IP addresses and user agents are logged for security

## Future Enhancements

### Potential Improvements
1. **Compression**: Compress archived images to save storage
2. **Tiered Storage**: Move old archives to cheaper storage
3. **Search Indexing**: Full-text search across archived content
4. **Bulk Operations**: Admin tools for bulk archive management
5. **Retention Policies**: Automated cleanup based on business rules
