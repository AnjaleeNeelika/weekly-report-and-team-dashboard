export interface User {
    id: number;
    created_at: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    has_initial_password_changed: boolean;
    is_active: boolean;
}

export interface NewUserFormData {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

export interface UserFetchResponse {
    success: boolean;
    message: string | null;
    data: User[];
    error?: string | null;
}
