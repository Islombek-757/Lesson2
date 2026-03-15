import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "School OS — AI-Powered Education Platform",
  description: "Learn smarter with AI-powered lessons, quizzes, and personalized tutoring. School OS is your modern classroom.",
  keywords: ["education", "learning", "AI tutor", "school", "lessons", "quiz"],
  openGraph: {
    title: "School OS — AI-Powered Education Platform",
    description: "Learn smarter with AI-powered lessons, quizzes, and personalized tutoring.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-color)",
                border: "1px solid var(--toast-border)",
                borderRadius: "12px",
                fontSize: "14px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
