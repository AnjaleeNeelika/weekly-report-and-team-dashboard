export type UserRole = "admin" | "manager" | "employee";

export interface CreateUserFormData {
    email: string;
    full_name: string;
    role: Exclude<UserRole, "admin">;
    temporary_password: string;
}

export interface SignInFormData {
    email: string;
    password: string;
}

export interface SignInFormErrors {
    email?: string;
    password?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
}