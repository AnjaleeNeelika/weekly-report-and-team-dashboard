"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SignInFormErrors, SignInFormData } from "@/types/auth";
import { loginUser } from "@/data/auth/data";
import { Loader2 } from "lucide-react";

export default function SignIn() {
    const [isLogging, setIsLogging] = useState(false);
    const [errors, setErrors] = useState<SignInFormErrors | null>(null);
    const [formData, setFormData] = useState<SignInFormData>({
        email: "",
        password: ""
    });
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors) {
            setErrors(prev => prev ? { ...prev, [name]: undefined } : null);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: SignInFormErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }
        return true;
    };

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLogging(true);
        setErrors(null);

        try {
            const res = await loginUser(formData.email, formData.password);

            if (res.has_initial_password_changed !== true) {
                router.push("/auth/change-password");
            } else {
                router.push("/dashboard");
            }
        } catch (error: any) {
            console.error("Error while logging in:", error);
            toast.error(error.message || "Failed to connect to authentication server.");
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center p-4 bg-gradient-to-r from-background to-primary/5">
            <Card className="w-full max-w-md shadow-xl shadow-primary/5">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl text-center font-bold">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your TeamSync account
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8">
                    <div className="flex flex-col gap-5">


                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="sample@example.com"
                                className={cn(errors?.email && "border-destructive focus-visible:ring-destructive")}
                                value={formData.email}
                                onChange={handleInputChange}
                                autoComplete="email"
                            />
                            {errors?.email && <span className="text-destructive text-xs">{errors.email}</span>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••••••••••"
                                className={cn(errors?.password && "border-destructive focus-visible:ring-destructive")}
                                value={formData.password}
                                onChange={handleInputChange}
                                autoComplete="current-password"
                            />
                            {errors?.password && <span className="text-destructive text-xs">{errors.password}</span>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button className="w-full" onClick={handleLogin} disabled={isLogging}>{isLogging ? <><Loader2 className="animate-spin h-4 w-4" /> Signing In...</> : "Sign In"}</Button>
                </CardFooter>
            </Card>
        </div >
    );
}