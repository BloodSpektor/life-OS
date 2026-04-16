"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Apple } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [loginEmailOrPhone, setLoginEmailOrPhone] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPhone, setRegisterPhone] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
    const [registerError, setRegisterError] = useState("");

    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateIndicator = () => {
            if (!listRef.current) return;

            const activeTab = listRef.current.querySelector('[data-state="active"]') as HTMLElement;
            if (activeTab) {
                const listRect = listRef.current.getBoundingClientRect();
                const tabRect = activeTab.getBoundingClientRect();

                setIndicatorStyle({
                    left: tabRect.left - listRect.left,
                    width: tabRect.width,
                });
            }
        };

        updateIndicator();

        const observer = new MutationObserver(updateIndicator);
        if (listRef.current) {
            observer.observe(listRef.current, {
                attributes: true,
                subtree: true,
                attributeFilter: ["data-state"],
            });
        }

        return () => observer.disconnect();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        if (loginPassword.length < 6) {
            setLoginError("Пароль должен содержать минимум 6 символов");
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailOrPhone: loginEmailOrPhone,
                    password: loginPassword,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                const error = await response.json();
                setLoginError(error.message || "Неверный логин или пароль");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginError("Ошибка подключения к серверу");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterError("");

        if (registerPassword !== registerConfirmPassword) {
            setRegisterError("Пароли не совпадают!");
            return;
        }

        if (registerPassword.length < 6) {
            setRegisterError("Пароль должен содержать минимум 6 символов");
            return;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerEmail)) {
            setRegisterError("Неверный формат email");
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: registerEmail,
                    phone: registerPhone || undefined,
                    password: registerPassword,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                const error = await response.json();
                setRegisterError(error.message || "Ошибка регистрации");
            }
        } catch (error) {
            console.error("Register error:", error);
            setRegisterError("Ошибка подключения к серверу");
        }
    };

    return (
        <div className="flex items-start justify-center bg-gray-50 px-4 pt-[75px]">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Apple className="h-12 w-12 text-green-600" />
                    <span className="text-3xl font-bold text-gray-900">Life OS</span>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center font-bold">Добро пожаловать</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TabsPrimitive.Root defaultValue="login" className="w-full flex flex-col gap-2">
                            <TabsPrimitive.List
                                ref={listRef}
                                className="bg-muted text-muted-foreground  grid grid-cols-2 h-9 w-full items-center justify-center rounded-xl p-[3px] relative mb-5"
                            >
                                {/* Анимированный индикатор */}
                                <div
                                    className="absolute h-[calc(100%-6px)] bg-white dark:bg-input/30 rounded-xl transition-all duration-1000 ease-in-out"
                                    style={{
                                        left: `${indicatorStyle.left}px`,
                                        width: `${indicatorStyle.width}px`,
                                    }}
                                />
                                <TabsPrimitive.Trigger
                                    value="login"
                                    className={cn(
                                        "relative z-10 data-[state=active]:text-foreground text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-300 outline-none",
                                    )}
                                >
                                    Вход
                                </TabsPrimitive.Trigger>
                                <TabsPrimitive.Trigger
                                    value="register"
                                    className={cn(
                                        "relative z-10 data-[state=active]:text-foreground text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-300 outline-none",
                                    )}
                                >
                                    Регистрация
                                </TabsPrimitive.Trigger>
                            </TabsPrimitive.List>

                            <TabsPrimitive.Content value="login" className="space-y-4 mt-6 outline-none">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email или номер телефона</Label>
                                        <Input
                                            id="login-email"
                                            type="text"
                                            placeholder="example@mail.com или +7..."
                                            value={loginEmailOrPhone}
                                            onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Пароль</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {loginError && (
                                        <p className="text-sm text-red-500">{loginError}</p>
                                    )}

                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                                        Войти
                                    </Button>
                                </form>
                            </TabsPrimitive.Content>

                            <TabsPrimitive.Content value="register" className="space-y-4 mt-6 outline-none">
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">Почта</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="example@mail.com"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-phone">Номер телефона (необязательно)</Label>
                                        <Input
                                            id="register-phone"
                                            type="tel"
                                            placeholder="+7..."
                                            value={registerPhone}
                                            onChange={(e) => setRegisterPhone(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">Пароль</Label>
                                        <Input
                                            id="register-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-confirm-password">Подтвердить пароль</Label>
                                        <Input
                                            id="register-confirm-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={registerConfirmPassword}
                                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {registerError && (
                                        <p className="text-sm text-red-500">{registerError}</p>
                                    )}

                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                                        Зарегистрироваться
                                    </Button>
                                </form>
                            </TabsPrimitive.Content>
                        </TabsPrimitive.Root>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
