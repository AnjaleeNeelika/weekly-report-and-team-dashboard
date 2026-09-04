import { api } from "@/lib/api";
import { NewUserFormData, UserFetchResponse } from "@/types/user";

export const getUsers = async (): Promise<UserFetchResponse> => {
    return api.get<UserFetchResponse>("/users");
}

export const createUser = async (user: NewUserFormData): Promise<{ message: string; email: string; setup_url: string }> => {
    return api.post<{ message: string; email: string; setup_url: string }>("/users/", user);
};