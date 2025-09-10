import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { config, validateConfig } from '../config/env';
import type { User, Snippet, Invitation, CreateSnippetData, UpdateSnippetData, ShareSnippetData, CollaborationRequest, CreateCollaborationRequestData } from '../types';

// Validate configuration on import
validateConfig();

// Appwrite configuration
const client = new Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Database and Collection IDs
const DATABASE_ID = config.appwrite.databaseId;
const SNIPPETS_COLLECTION_ID = config.appwrite.snippetsCollectionId;
const USERS_COLLECTION_ID = config.appwrite.usersCollectionId;
const INVITATIONS_COLLECTION_ID = config.appwrite.invitationsCollectionId;
const COLLABORATION_REQUESTS_COLLECTION_ID = 'collaboration_requests'; // You'll need to create this collection
const AVATARS_BUCKET_ID = 'avatars'; // You'll need to create this bucket

// Auth API
export const authAPI = {
    // Get current user
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const user = await account.get();
            return {
                $id: user.$id,
                name: user.name,
                email: user.email,
                avatar: (user as { avatar?: string }).avatar,
                createdAt: user.$createdAt,
                updatedAt: user.$updatedAt,
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Create account
    createAccount: async (name: string, email: string, password: string): Promise<User> => {
        try {
            const user = await account.create(ID.unique(), email, password, name);

            // Create user document in database
            await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, {
                name,
                email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            return {
                $id: user.$id,
                name: user.name,
                email: user.email,
                avatar: (user as { avatar?: string }).avatar,
                createdAt: user.$createdAt,
                updatedAt: user.$updatedAt,
            };
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    },

    // Create email session
    createEmailSession: async (email: string, password: string): Promise<void> => {
        try {
            await account.createEmailPasswordSession(email, password);
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    },

    // Delete session
    deleteSession: async (): Promise<void> => {
        try {
            await account.deleteSession('current');
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    },
};

// Snippets API
export const snippetsAPI = {
    // Get public snippets
    getPublicSnippets: async (limit: number = 20, offset: number = 0): Promise<Snippet[]> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                SNIPPETS_COLLECTION_ID,
                [
                    Query.equal('isPublic', true),
                    Query.orderDesc('createdAt'),
                    Query.limit(limit),
                    Query.offset(offset),
                ]
            );

            return response.documents as unknown as Snippet[];
        } catch (error) {
            console.error('Error getting public snippets:', error);
            throw error;
        }
    },

    // Get user's snippets
    getUserSnippets: async (userId: string, limit: number = 20, offset: number = 0): Promise<Snippet[]> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                SNIPPETS_COLLECTION_ID,
                [
                    Query.equal('ownerId', userId),
                    Query.orderDesc('createdAt'),
                    Query.limit(limit),
                    Query.offset(offset),
                ]
            );

            return response.documents as unknown as Snippet[];
        } catch (error) {
            console.error('Error getting user snippets:', error);
            throw error;
        }
    },

    // Get snippet by ID
    getSnippet: async (snippetId: string): Promise<Snippet> => {
        try {
            const snippet = await databases.getDocument(
                DATABASE_ID,
                SNIPPETS_COLLECTION_ID,
                snippetId
            );

            return snippet as unknown as Snippet;
        } catch (error) {
            console.error('Error getting snippet:', error);
            throw error;
        }
    },

    // Create snippet
    createSnippet: async (data: CreateSnippetData, userId: string): Promise<Snippet> => {
        try {
            const snippet = await databases.createDocument(
                DATABASE_ID,
                SNIPPETS_COLLECTION_ID,
                ID.unique(),
                {
                    ...data,
                    ownerId: userId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            );

            return snippet as unknown as Snippet;
        } catch (error) {
            console.error('Error creating snippet:', error);
            throw error;
        }
    },

    // Update snippet
    updateSnippet: async (snippetId: string, data: UpdateSnippetData): Promise<Snippet> => {
        try {
            const snippet = await databases.updateDocument(
                DATABASE_ID,
                SNIPPETS_COLLECTION_ID,
                snippetId,
                {
                    ...data,
                    updatedAt: new Date().toISOString(),
                }
            );

            return snippet as unknown as Snippet;
        } catch (error) {
            console.error('Error updating snippet:', error);
            throw error;
        }
    },

    // Delete snippet
    deleteSnippet: async (snippetId: string): Promise<void> => {
        try {
            await databases.deleteDocument(DATABASE_ID, SNIPPETS_COLLECTION_ID, snippetId);
        } catch (error) {
            console.error('Error deleting snippet:', error);
            throw error;
        }
    },

    // Search snippets
    searchSnippets: async (query: string, isPublic: boolean = true): Promise<Snippet[]> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                SNIPPETS_COLLECTION_ID,
                [
                    Query.equal('isPublic', isPublic),
                    Query.or([
                        Query.search('title', query),
                        Query.search('description', query),
                        Query.search('code', query),
                        Query.search('tags', query),
                    ]),
                    Query.orderDesc('createdAt'),
                ]
            );

            return response.documents as unknown as Snippet[];
        } catch (error) {
            console.error('Error searching snippets:', error);
            throw error;
        }
    },
};

// Sharing API
export const sharingAPI = {
    // Share snippet
    shareSnippet: async (data: ShareSnippetData, snippetId: string, inviterId: string): Promise<Invitation> => {
        try {
            // Check if invitation already exists for this snippet and email
            const existingInvitations = await databases.listDocuments(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID,
                [
                    Query.equal('snippetId', snippetId),
                    Query.equal('inviteeEmail', data.inviteeEmail)
                ]
            );

            if (existingInvitations.documents.length > 0) {
                const existingInvitation = existingInvitations.documents[0] as unknown as Invitation;

                // If invitation exists and is not expired, throw an error
                if (existingInvitation.status === 'pending' && new Date(existingInvitation.expiresAt) > new Date()) {
                    throw new Error(`An invitation has already been sent to ${data.inviteeEmail} for this snippet.`);
                }

                // If invitation exists but is expired or declined, update it instead of creating new one
                if (existingInvitation.status === 'declined' || new Date(existingInvitation.expiresAt) <= new Date()) {
                    const updatedInvitation = await databases.updateDocument(
                        DATABASE_ID,
                        INVITATIONS_COLLECTION_ID,
                        existingInvitation.$id,
                        {
                            permissions: data.permissions,
                            status: 'pending',
                            token: ID.unique(),
                            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
                            updatedAt: new Date().toISOString(),
                        }
                    );

                    // Send email notification
                    await sendInvitationEmail(updatedInvitation as unknown as Invitation, snippetId);
                    return updatedInvitation as unknown as Invitation;
                }
            }

            // Create new invitation if none exists
            const invitation = await databases.createDocument(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID,
                ID.unique(),
                {
                    snippetId,
                    inviterId,
                    inviteeEmail: data.inviteeEmail,
                    permissions: data.permissions,
                    status: 'pending',
                    token: ID.unique(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
                    createdAt: new Date().toISOString(),
                }
            );

            // Send email notification (in a real app, you'd use a service like SendGrid, Resend, etc.)
            await sendInvitationEmail(invitation as unknown as Invitation, snippetId);

            return invitation as unknown as Invitation;
        } catch (error) {
            console.error('Error sharing snippet:', error);
            throw error;
        }
    },

    // Get snippet invitations
    getSnippetInvitations: async (snippetId: string): Promise<Invitation[]> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID,
                [Query.equal('snippetId', snippetId)]
            );

            return response.documents as unknown as Invitation[];
        } catch (error) {
            console.error('Error getting snippet invitations:', error);
            throw error;
        }
    },

    // Get user invitations
    getUserInvitations: async (userEmail: string): Promise<Invitation[]> => {
        try {
            console.log('🔍 Searching for invitations with email:', userEmail);
            const response = await databases.listDocuments(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID,
                [Query.equal('inviteeEmail', userEmail)]
            );

            console.log('📧 Raw response:', response);
            console.log('📧 Documents found:', response.documents);
            return response.documents as unknown as Invitation[];
        } catch (error) {
            console.error('Error getting user invitations:', error);
            throw error;
        }
    },

    // Get all invitations (for debugging)
    getAllInvitations: async (): Promise<Invitation[]> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID
            );

            console.log('🔍 All invitations in database:', response.documents);
            return response.documents as unknown as Invitation[];
        } catch (error) {
            console.error('Error getting all invitations:', error);
            throw error;
        }
    },

    // Check if invitation already exists for a snippet and email
    checkExistingInvitation: async (snippetId: string, email: string): Promise<Invitation | null> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID,
                [
                    Query.equal('snippetId', snippetId),
                    Query.equal('inviteeEmail', email)
                ]
            );

            if (response.documents.length > 0) {
                return response.documents[0] as unknown as Invitation;
            }
            return null;
        } catch (error) {
            console.error('Error checking existing invitation:', error);
            throw error;
        }
    },

    // Accept invitation
    acceptInvitation: async (invitationId: string): Promise<Invitation> => {
        try {
            const invitation = await databases.updateDocument(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID,
                invitationId,
                { status: 'accepted' }
            );

            return invitation as unknown as Invitation;
        } catch (error) {
            console.error('Error accepting invitation:', error);
            throw error;
        }
    },

    // Decline invitation
    declineInvitation: async (invitationId: string): Promise<Invitation> => {
        try {
            const invitation = await databases.updateDocument(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID,
                invitationId,
                { status: 'declined' }
            );

            return invitation as unknown as Invitation;
        } catch (error) {
            console.error('Error declining invitation:', error);
            throw error;
        }
    },
};

// Email notification function (mock implementation)
const sendInvitationEmail = async (invitation: Invitation, snippetId: string): Promise<void> => {
    try {
        // In a real application, you would integrate with an email service like:
        // - SendGrid
        // - Resend
        // - AWS SES
        // - Nodemailer with SMTP

        // For now, we'll just log the invitation details
        console.log('📧 Email notification would be sent:', {
            to: invitation.inviteeEmail,
            subject: 'You\'ve been invited to collaborate on a code snippet',
            invitationId: invitation.$id,
            snippetId: snippetId,
            permissions: invitation.permissions,
            expiresAt: invitation.expiresAt,
            // In a real app, you'd include a link like:
            // acceptLink: `${window.location.origin}/invitations/accept?token=${invitation.token}`
        });

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
        console.error('Error sending invitation email:', error);
        // Don't throw error here to avoid breaking the invitation creation
    }
};

// Users API
export const usersAPI = {
    // Search users by email or name
    searchUsers: async (query: string): Promise<User[]> => {
        try {
            // Return empty array if query is too short
            if (!query || query.trim().length < 2) {
                return [];
            }

            const trimmedQuery = query.trim();

            // Use exact matching and startsWith instead of fulltext search to avoid index requirements
            const response = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                [
                    Query.or([
                        Query.equal('email', trimmedQuery),
                        Query.startsWith('email', trimmedQuery),
                        Query.startsWith('name', trimmedQuery),
                    ]),
                    Query.limit(10) // Limit results for performance
                ]
            );

            return response.documents as unknown as User[];
        } catch (error) {
            console.error('Error searching users:', error);
            // Return empty array instead of throwing to prevent UI errors
            return [];
        }
    },

    // Get user by email
    getUserByEmail: async (email: string): Promise<User | null> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                [Query.equal('email', email)]
            );

            if (response.documents.length > 0) {
                return response.documents[0] as unknown as User;
            }
            return null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    },

    // Create user profile
    createUser: async (data: { name: string; email: string; avatar?: string }): Promise<User> => {
        try {
            const user = await databases.createDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                ID.unique(),
                {
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            );

            return user as unknown as User;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update user profile
    updateUser: async (userId: string, data: { name?: string; avatar?: string }): Promise<User> => {
        try {
            const user = await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userId,
                {
                    ...data,
                    updatedAt: new Date().toISOString(),
                }
            );

            return user as unknown as User;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },
};

// Collaboration Requests API
export const collaborationAPI = {
    // Create collaboration request
    createCollaborationRequest: async (data: CreateCollaborationRequestData, snippetId: string, requesterId: string): Promise<CollaborationRequest> => {
        try {
            // Check if request already exists
            const existingRequests = await databases.listDocuments(
                DATABASE_ID,
                COLLABORATION_REQUESTS_COLLECTION_ID,
                [
                    Query.equal('snippetId', snippetId),
                    Query.equal('requesterId', requesterId),
                    Query.equal('recipientId', data.recipientId)
                ]
            );

            if (existingRequests.documents.length > 0) {
                const existingRequest = existingRequests.documents[0] as unknown as CollaborationRequest;

                if (existingRequest.status === 'pending') {
                    throw new Error('A collaboration request has already been sent to this user for this snippet.');
                }

                // If request was declined, update it
                if (existingRequest.status === 'declined') {
                    const updatedRequest = await databases.updateDocument(
                        DATABASE_ID,
                        COLLABORATION_REQUESTS_COLLECTION_ID,
                        existingRequest.$id,
                        {
                            permissions: data.permissions,
                            message: data.message,
                            status: 'pending',
                            updatedAt: new Date().toISOString(),
                        }
                    );
                    return updatedRequest as unknown as CollaborationRequest;
                }
            }

            // Create new collaboration request
            const request = await databases.createDocument(
                DATABASE_ID,
                COLLABORATION_REQUESTS_COLLECTION_ID,
                ID.unique(),
                {
                    snippetId,
                    requesterId,
                    recipientId: data.recipientId,
                    permissions: data.permissions,
                    message: data.message || '',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            );

            return request as unknown as CollaborationRequest;
        } catch (error) {
            console.error('Error creating collaboration request:', error);
            throw error;
        }
    },

    // Get user's collaboration requests (received)
    getUserCollaborationRequests: async (userId: string): Promise<CollaborationRequest[]> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLABORATION_REQUESTS_COLLECTION_ID,
                [Query.equal('recipientId', userId)]
            );

            return response.documents as unknown as CollaborationRequest[];
        } catch (error) {
            console.error('Error getting user collaboration requests:', error);
            throw error;
        }
    },

    // Get collaboration requests sent by user
    getSentCollaborationRequests: async (userId: string): Promise<CollaborationRequest[]> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLABORATION_REQUESTS_COLLECTION_ID,
                [Query.equal('requesterId', userId)]
            );

            return response.documents as unknown as CollaborationRequest[];
        } catch (error) {
            console.error('Error getting sent collaboration requests:', error);
            throw error;
        }
    },

    // Accept collaboration request
    acceptCollaborationRequest: async (requestId: string): Promise<CollaborationRequest> => {
        try {
            const request = await databases.updateDocument(
                DATABASE_ID,
                COLLABORATION_REQUESTS_COLLECTION_ID,
                requestId,
                {
                    status: 'accepted',
                    updatedAt: new Date().toISOString()
                }
            );

            return request as unknown as CollaborationRequest;
        } catch (error) {
            console.error('Error accepting collaboration request:', error);
            throw error;
        }
    },

    // Decline collaboration request
    declineCollaborationRequest: async (requestId: string): Promise<CollaborationRequest> => {
        try {
            const request = await databases.updateDocument(
                DATABASE_ID,
                COLLABORATION_REQUESTS_COLLECTION_ID,
                requestId,
                {
                    status: 'declined',
                    updatedAt: new Date().toISOString()
                }
            );

            return request as unknown as CollaborationRequest;
        } catch (error) {
            console.error('Error declining collaboration request:', error);
            throw error;
        }
    },

    // Get collaboration request by ID
    getCollaborationRequest: async (requestId: string): Promise<CollaborationRequest> => {
        try {
            const request = await databases.getDocument(
                DATABASE_ID,
                COLLABORATION_REQUESTS_COLLECTION_ID,
                requestId
            );

            return request as unknown as CollaborationRequest;
        } catch (error) {
            console.error('Error getting collaboration request:', error);
            throw error;
        }
    },
};

// Shared Snippets API
export const sharedSnippetsAPI = {
    // Get snippets user has access to via accepted invitations
    getSharedSnippets: async (userEmail: string): Promise<Snippet[]> => {
        try {
            // First, get all accepted invitations for this user
            const invitations = await databases.listDocuments(
                DATABASE_ID,
                INVITATIONS_COLLECTION_ID,
                [
                    Query.equal('inviteeEmail', userEmail),
                    Query.equal('status', 'accepted')
                ]
            );

            if (invitations.documents.length === 0) {
                return [];
            }

            // Get snippet IDs from accepted invitations
            const snippetIds = invitations.documents.map(inv => inv.snippetId);

            // Fetch the actual snippets
            const snippets = await Promise.all(
                snippetIds.map(async (snippetId) => {
                    try {
                        const snippet = await databases.getDocument(
                            DATABASE_ID,
                            SNIPPETS_COLLECTION_ID,
                            snippetId
                        );
                        return snippet as unknown as Snippet;
                    } catch (error) {
                        console.warn(`Could not fetch snippet ${snippetId}:`, error);
                        return null;
                    }
                })
            );

            // Filter out null results and return
            return snippets.filter((snippet): snippet is Snippet => snippet !== null);
        } catch (error) {
            console.error('Error getting shared snippets:', error);
            throw error;
        }
    },

    // Get all snippets user has access to (own + shared)
    getAllAccessibleSnippets: async (userId: string, userEmail: string): Promise<{
        owned: Snippet[];
        shared: Snippet[];
    }> => {
        try {
            const [ownedSnippets, sharedSnippets] = await Promise.all([
                snippetsAPI.getUserSnippets(userId),
                sharedSnippetsAPI.getSharedSnippets(userEmail)
            ]);

            return {
                owned: ownedSnippets,
                shared: sharedSnippets
            };
        } catch (error) {
            console.error('Error getting all accessible snippets:', error);
            throw error;
        }
    },
};

// Storage API
export const storageAPI = {
    // Upload avatar image
    uploadAvatar: async (file: File): Promise<string> => {
        try {
            const response = await storage.createFile(
                AVATARS_BUCKET_ID,
                ID.unique(),
                file
            );

            // Get the file URL
            const fileUrl = storage.getFileView(AVATARS_BUCKET_ID, response.$id);
            return fileUrl.toString();
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    },

    // Delete avatar image
    deleteAvatar: async (fileId: string): Promise<void> => {
        try {
            await storage.deleteFile(AVATARS_BUCKET_ID, fileId);
        } catch (error) {
            console.error('Error deleting avatar:', error);
            throw error;
        }
    },

    // Get avatar URL
    getAvatarUrl: (fileId: string): string => {
        return storage.getFileView(AVATARS_BUCKET_ID, fileId).toString();
    },
};

export { client, account, databases, storage };
