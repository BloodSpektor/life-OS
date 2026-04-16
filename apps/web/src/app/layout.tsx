import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/components/Layout";

export const metadata: Metadata = {
    title: "Life OS - Your Health & Lifestyle Manager",
    description: "Track your nutrition, hydration, workouts and more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
            <body>
                <Layout>{children}</Layout>
            </body>
        </html>
    );
}
