# CodeCache - Snippet Management Application

A modern, full-stack code snippet management application built with React, TypeScript, and Appwrite. Users can create, manage, and share code snippets with public/private visibility and collaborative sharing features.

## Features

- 🔐 **Authentication**: User registration and login with Appwrite
- 📝 **Snippet Management**: Create, edit, delete, and organize code snippets
- 🌐 **Public/Private Snippets**: Choose visibility for your snippets
- 🔍 **Search**: Find snippets by title, description, code, or tags
- 👥 **Sharing**: Invite others to collaborate on your snippets
- 🏷️ **Tagging**: Organize snippets with custom tags
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Appwrite (Backend-as-a-Service)
- **Database**: Appwrite Database
- **Authentication**: Appwrite Auth
- **Storage**: Appwrite Storage
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

1. Node.js (v18 or higher)
2. npm or yarn
3. Appwrite account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd snippetly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Appwrite**
   - Follow the detailed guide in `APPWRITE_SETUP.md`
   - Create your Appwrite project and configure the database
   - Set up the required collections and permissions

4. **Configure environment variables**
   Create a `.env.local` file in the project root:
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id_here
   VITE_APPWRITE_DATABASE_ID=codecache_db
   VITE_APPWRITE_SNIPPETS_COLLECTION_ID=snippets
   VITE_APPWRITE_USERS_COLLECTION_ID=users
   VITE_APPWRITE_INVITATIONS_COLLECTION_ID=invitations
   VITE_APPWRITE_STORAGE_BUCKET_ID=snippet_files
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── AuthModal.tsx   # Authentication modal
│   ├── SnippetCard.tsx # Snippet display component
│   ├── CreateSnippetModal.tsx
│   └── ShareSnippetModal.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                # Utility libraries
│   ├── appwrite.ts     # Appwrite API functions
│   └── utils.ts        # General utilities
├── pages/              # Page components
│   ├── HomePage.tsx    # Public snippets page
│   └── DashboardPage.tsx # User dashboard
├── types/              # TypeScript type definitions
│   └── index.ts
├── config/             # Configuration files
│   └── env.ts          # Environment configuration
└── App.tsx             # Main app component
```

## Usage

### For Anonymous Users
- Browse public snippets on the home page
- Search through public snippets
- View snippet details (read-only)

### For Authenticated Users
- Create new snippets (public or private)
- Manage your personal snippets in the dashboard
- Share snippets with others via email invitations
- Edit and delete your own snippets
- Search through your personal snippets

### Snippet Sharing
- Send email invitations to collaborate on snippets
- Set different permission levels (read, write, admin)
- Manage invitation status and permissions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

3. **Update CORS settings**
   - Add your domain to Appwrite CORS settings
   - Update environment variables for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the `APPWRITE_SETUP.md` guide
- Review the Appwrite documentation
- Open an issue in the repository

## Roadmap

- [ ] Snippet versioning and history
- [ ] Real-time collaboration
- [ ] File attachments for snippets
- [ ] Advanced search filters
- [ ] Snippet collections/folders
- [ ] Export/import functionality
- [ ] API for third-party integrations