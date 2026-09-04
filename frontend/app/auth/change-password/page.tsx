"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function ChangePasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!token) return toast.error("This password setup link is missing its token.");
        if (password.length < 8) return toast.error("Password must be at least 8 characters.");
        if (password !== confirmation) return toast.error("Passwords do not match.");

        setIsSubmitting(true);
        try {
            await api.post("/auth/set-initial-password", { token, new_password: password });
            toast.success("Password set successfully. You can now sign in.");
            router.replace("/auth/signin");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to set password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-1 items-center justify-center p-4 bg-linear-to-br from-background to-primary/5">
            <Card className="w-full max-w-md shadow-xl shadow-primary/5">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-center font-bold">Change Password</CardTitle>
                    <CardDescription className="text-center">
                        Set up a new password for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">New password</Label>
                            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirmation">Confirm password</Label>
                            <Input id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Set password"}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
