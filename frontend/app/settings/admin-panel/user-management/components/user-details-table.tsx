"use client";

import { getUsers } from "@/data/user/data";
import { User } from "@/types/user";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Loader2, Trash2 } from "lucide-react";

interface UserDetailsTableProps {
    searchTerm: string;
    selectedRole: string | undefined;
}

export default function UserDetailsTable({ searchTerm, selectedRole }: UserDetailsTableProps) {
    const { user: currentUser, isLoading: isAuthLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllUsers = async () => {
            setError(null);
            setIsLoading(true);

            try {
                const response = await getUsers();

                if (!response.success) {
                    throw new Error(response.message || response.error || "Unable to load users.");
                }

                setUsers(response.data);
                console.log("Users: ", response.data);
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : "Unable to load users.");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchAllUsers();
    }, []);

    const visibleUsers = users.filter((user) => {
        const matchesRole = !selectedRole || selectedRole === "all" || user.role === selectedRole;
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        const matchesSearch = !normalizedSearchTerm ||
            `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(normalizedSearchTerm);

        if (!matchesRole || !matchesSearch) return false;
        if (currentUser?.role === "admin") return true;
        if (currentUser?.role === "manager") return user.role === "team_member";
        return String(user.id) === String(currentUser?.id);
    });

    if (isAuthLoading || isLoading) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" />
                    Loading users...
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-destructive text-center">{error}</CardContent>
            </Card>
        );
    }

    if (visibleUsers.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-muted-foreground text-center">No users found.</CardContent>
            </Card>
        );
    }

    return (
        <Card className="p-0">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted-foreground">
                            <TableHead className="bg-foreground text-background font-semibold px-5">Name</TableHead>
                            <TableHead className="bg-foreground text-background font-semibold px-5">Email</TableHead>
                            <TableHead className="bg-foreground text-background font-semibold px-5">Role</TableHead>
                            <TableHead className="bg-foreground text-background font-semibold px-5">Status</TableHead>
                            <TableHead className="bg-foreground text-background font-semibold px-5">Created At</TableHead>
                            <TableHead className="bg-foreground text-background font-semibold px-5">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="px-5">
                                    {`${user.first_name} ${user.last_name}`.trim() || "-"}
                                </TableCell>
                                <TableCell className="px-5">{user.email}</TableCell>
                                <TableCell className="capitalize px-5">{user.role.replaceAll("_", " ")}</TableCell>
                                <TableCell className="px-5">
                                    <span className={user.is_active
                                        ? "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-500"
                                        : "inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"}>
                                        {user.is_active ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-5">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="px-5">
                                    <Button variant="ghost" className="text-blue-500 hover:bg-blue-50 hover:text-blue-500 cursor-pointer">
                                        <Eye />
                                    </Button>
                                    <Button variant="ghost" className="text-green-500 hover:bg-green-50 hover:text-green-500 cursor-pointer">
                                        <Edit />
                                    </Button>
                                    <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                                        <Trash2 />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}