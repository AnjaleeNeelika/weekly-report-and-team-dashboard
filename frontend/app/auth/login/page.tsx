"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginForm } from "@/types/auth";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function Login() {
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [formData, setFormData] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const validateFields = () => {
        const nextErrors = {
            email: "",
            password: "",
        };

        if (!formData.email.trim()) {
            nextErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nextErrors.email = "Enter a valid email address";
        }

        if (!formData.password) {
            nextErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            nextErrors.password = "Password must be at least 8 characters";
        }

        setErrors(nextErrors);
        return !nextErrors.email && !nextErrors.password;
    };

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateFields()) {
            return;
        }

        setIsSigningIn(true);

        try {
            console.log("Login: ", formData);
            router.push("/overview");
        } catch (error) {
            console.error("Unable to sign in", error);
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <div className="p-5 bg-linear-to-br from-primary/10 to-primary/5 w-full flex-1 flex items-center justify-center">
            <Card className="w-full max-w-[400px]">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription >Sign in to your TeamSync account</CardDescription>
                </CardHeader>

                <form onSubmit={handleLogin} noValidate>
                    <CardContent className="space-y-1">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        email: event.target.value,
                                    }))
                                }
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? "email-error" : undefined}
                            />
                            {errors.email && (
                                <p id="email-error" className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={(event) =>
                                    setFormData((current) => ({
                                        ...current,
                                        password: event.target.value,
                                    }))
                                }
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? "password-error" : undefined}
                            />
                            {errors.password && (
                                <p id="password-error" className="text-sm text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="mt-4">
                        <Button className="w-full" type="submit" disabled={isSigningIn}>
                            {isSigningIn ? "Signing in..." : "Sign In"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}