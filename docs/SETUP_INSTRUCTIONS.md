# Quick Setup Instructions

## 1. Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=codecache_db
VITE_APPWRITE_SNIPPETS_COLLECTION_ID=snippets
VITE_APPWRITE_USERS_COLLECTION_ID=users
VITE_APPWRITE_INVITATIONS_COLLECTION_ID=invitations
VITE_APPWRITE_STORAGE_BUCKET_ID=snippet_files
```

## 2. Appwrite Setup

1. Go to [appwrite.io](https://appwrite.io) and create an account
2. Create a new project
3. Follow the detailed setup guide in `APPWRITE_SETUP.md`
4. Copy your Project ID to the `.env.local` file

## 3. Run the Application

```bash
npm run dev
```

## 4. Features

### For Anonymous Users:
- ✅ Browse public snippets
- ✅ Search public snippets
- ✅ Create public snippets (new!)

### For Authenticated Users:
- ✅ All anonymous user features
- ✅ Create private snippets
- ✅ Manage personal snippets in dashboard
- ✅ Share snippets with others
- ✅ Edit and delete own snippets

## 5. Troubleshooting

If you see "useAuth must be used within an AuthProvider" error:
1. Make sure your `.env.local` file is properly configured
2. Check that your Appwrite project is set up correctly
3. Restart the development server

The application will show a loading state while checking authentication status.

