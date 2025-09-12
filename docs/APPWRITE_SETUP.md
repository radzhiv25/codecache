# Appwrite Setup Guide for CodeCache

This guide will help you set up Appwrite for your CodeCache application, including authentication, database, and storage configuration.

## Prerequisites

1. Create an Appwrite account at [appwrite.io](https://appwrite.io)
2. Create a new project in your Appwrite console

## 1. Project Configuration

### Get Your Project Details
1. Go to your Appwrite console
2. Select your project
3. Go to **Settings** → **General**
4. Copy your:
   - **Project ID**
   - **API Endpoint** (usually `https://cloud.appwrite.io/v1`)

### Environment Variables
Create a `.env.local` file in your project root:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=codecache_db
VITE_APPWRITE_SNIPPETS_COLLECTION_ID=snippets
VITE_APPWRITE_USERS_COLLECTION_ID=users
VITE_APPWRITE_INVITATIONS_COLLECTION_ID=invitations
VITE_APPWRITE_STORAGE_BUCKET_ID=snippet_files
```

## 2. Database Setup

### Create Database
1. Go to **Databases** in your Appwrite console
2. Click **Create Database**
3. Name: `CodeCache Database`
4. Database ID: `codecache_db`

### Create Collections

#### 1. Users Collection (`users`)
**Attributes:**
- `name` (String, 255 chars, required)
- `email` (String, 255 chars, required, unique)
- `avatar` (String, 500 chars, optional)
- `createdAt` (DateTime, required)
- `updatedAt` (DateTime, required)

**Indexes:**
- `email` (unique)

**Permissions:**
- Create: `users` (authenticated users)
- Read: `users` (authenticated users)
- Update: `users` (authenticated users)
- Delete: `users` (authenticated users)

#### 2. Snippets Collection (`snippets`)
**Attributes:**
- `title` (String, 255 chars, required)
- `description` (String, 1000 chars, optional)
- `code` (String, 10000 chars, required)
- `language` (String, 50 chars, required)
- `tags` (String[], required)
- `isPublic` (Boolean, required, default: false)
- `ownerId` (String, 255 chars, required)
- `createdAt` (DateTime, required)
- `updatedAt` (DateTime, required)
- `lastModifiedBy` (String, 255 chars, optional)

**Indexes:**
- `ownerId` (key)
- `isPublic` (key)
- `language` (key)
- `tags` (array)
- `createdAt` (key, desc)

**Permissions:**
- Create: `users` (authenticated users)
- Read: `any` (for public snippets), `users` (for private snippets)
- Update: `users` (authenticated users)
- Delete: `users` (authenticated users)

#### 3. Invitations Collection (`invitations`)
**Attributes:**
- `snippetId` (String, 255 chars, required)
- `inviterId` (String, 255 chars, required)
- `inviteeEmail` (String, 255 chars, required)
- `permissions` (String[], required) // ['read', 'write', 'admin']
- `status` (String, 50 chars, required) // 'pending', 'accepted', 'declined'
- `token` (String, 255 chars, required, unique)
- `expiresAt` (DateTime, required)
- `createdAt` (DateTime, required)

**Indexes:**
- `snippetId` (key)
- `inviteeEmail` (key)
- `token` (unique)
- `status` (key)

**Permissions:**
- Create: `users` (authenticated users)
- Read: `users` (authenticated users)
- Update: `users` (authenticated users)
- Delete: `users` (authenticated users)

## 3. Storage Setup

### Create Storage Bucket
1. Go to **Storage** in your Appwrite console
2. Click **Create Bucket**
3. Name: `Snippet Files`
4. Bucket ID: `snippet_files`
5. File size limit: 10MB
6. Allowed file extensions: `.txt`, `.js`, `.ts`, `.py`, `.java`, `.cpp`, `.c`, `.html`, `.css`, `.json`, `.xml`, `.md`

**Permissions:**
- Create: `users` (authenticated users)
- Read: `any` (for public files), `users` (for private files)
- Update: `users` (authenticated users)
- Delete: `users` (authenticated users)

## 4. Authentication Setup

### Enable Authentication Methods
1. Go to **Auth** in your Appwrite console
2. Enable the following providers:
   - **Email/Password** (required)
   - **Google** (optional)
   - **Apple** (optional)
   - **GitHub** (optional)

### Configure Email/Password
1. Go to **Auth** → **Settings**
2. Enable **Email/Password** authentication
3. Configure email templates for:
   - Email verification
   - Password reset
   - Magic URL login

### Configure OAuth Providers (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy Client ID and Client Secret to Appwrite

#### Apple OAuth
1. Go to [Apple Developer Console](https://developer.apple.com)
2. Create a new App ID
3. Configure Sign in with Apple
4. Create a Service ID
5. Generate a private key
6. Add credentials to Appwrite

## 5. Security Rules

### Database Security
- Users can only create, read, update, delete their own snippets
- Public snippets are readable by anyone
- Private snippets are only readable by owner and invited users
- Invitations can only be managed by snippet owners

### Storage Security
- Users can upload files to their own snippets
- Public snippet files are readable by anyone
- Private snippet files are only readable by owner and invited users

## 6. Functions (Optional)

### Email Notifications
Create a function to send email notifications for:
- New snippet invitations
- Snippet access granted/revoked
- Account verification

### Backup Function
Create a function to backup snippets periodically.

## 7. Testing Your Setup

### Test Authentication
```javascript
import { Client, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('YOUR_ENDPOINT')
    .setProject('YOUR_PROJECT_ID');

const account = new Account(client);

// Test signup
const user = await account.create('unique()', 'user@example.com', 'password', 'User Name');

// Test login
const session = await account.createEmailPasswordSession('user@example.com', 'password');
```

### Test Database
```javascript
import { Databases } from 'appwrite';

const databases = new Databases(client);

// Test creating a snippet
const snippet = await databases.createDocument(
    'codecache_db',
    'snippets',
    'unique()',
    {
        title: 'Test Snippet',
        code: 'console.log("Hello World");',
        language: 'javascript',
        tags: ['test', 'example'],
        isPublic: true,
        ownerId: user.$id
    }
);
```

## 8. Production Considerations

### Security
- Enable CORS for your domain
- Set up proper rate limiting
- Use HTTPS in production
- Regularly rotate API keys

### Performance
- Set up CDN for file storage
- Configure database indexes properly
- Monitor usage and scale as needed

### Monitoring
- Set up Appwrite monitoring
- Configure alerts for errors
- Monitor authentication attempts
- Track storage usage

## 9. Environment-Specific Configuration

### Development
- Use Appwrite Cloud or local development server
- Enable debug logging
- Use test email addresses

### Production
- Use Appwrite Cloud with production project
- Disable debug logging
- Use production email service
- Enable all security features

## 10. Troubleshooting

### Common Issues
1. **CORS errors**: Check domain configuration in Appwrite console
2. **Permission denied**: Verify collection permissions and user authentication
3. **File upload fails**: Check file size limits and allowed extensions
4. **Email not sending**: Verify email configuration and templates

### Support
- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Discord](https://discord.gg/appwrite)
- [GitHub Issues](https://github.com/appwrite/appwrite/issues)

## Next Steps

After completing this setup:
1. Implement the authentication context in your React app
2. Create API service functions for database operations
3. Implement the snippet management interface
4. Add invitation system for sharing snippets
5. Set up file upload for snippet attachments

