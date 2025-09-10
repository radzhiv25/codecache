export interface User {
    $id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Snippet {
    $id: string;
    title: string;
    description?: string;
    code: string;
    language: string;
    tags: string[];
    isPublic: boolean;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    lastModifiedBy?: string;
}

export interface Invitation {
    $id: string;
    snippetId: string;
    inviterId: string;
    inviteeEmail: string;
    permissions: ('read' | 'write' | 'admin')[];
    status: 'pending' | 'accepted' | 'declined';
    token: string;
    expiresAt: string;
    createdAt: string;
}

export interface CreateSnippetData {
    title: string;
    description?: string;
    code: string;
    language: string;
    tags: string[];
    isPublic: boolean;
}

export interface UpdateSnippetData extends Partial<CreateSnippetData> {
    lastModifiedBy?: string;
}

export interface ShareSnippetData {
    inviteeEmail: string;
    permissions: ('read' | 'write' | 'admin')[];
}

export interface CollaborationRequest {
    $id: string;
    snippetId: string;
    requesterId: string;
    recipientId: string;
    permissions: ('read' | 'write' | 'admin')[];
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCollaborationRequestData {
    recipientId: string;
    permissions: ('read' | 'write' | 'admin')[];
    message?: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}
