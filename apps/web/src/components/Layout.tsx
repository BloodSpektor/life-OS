"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Refrigerator, Apple, Wallet, Bell, BarChart3, LogIn, User } from "lucide-react";
import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const navItems = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/fridge", label: "Холодильник", icon: Refrigerator },
    { href: "/nutrition", label: "Питание", icon: Apple },
    { href: "/expenses", label: "Траты", icon: Wallet },
    { href: "/reminders", label: "Уведомления", icon: Bell },
    { href: "/statistics", label: "Статистика", icon: BarChart3 },
  ];

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) return;
    
    e.preventDefault();
    setIsNavigating(true);
    
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Apple className="h-8 w-8 text-green-600" />
              <span className="text-xl font-semibold text-gray-900">Life OS</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              {/* Login/Profile Button */}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={(e) => handleNavClick(e, "/profile")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Профиль</span>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={(e) => handleNavClick(e, "/auth/login")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Вход</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Loading Overlay */}
      {(isNavigating || isPending) && (
        <div className="fixed inset-0 bg-gray-50 z-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[22px]">
        {children}
      </main>
    </div>
  );
}
