"use client";

import { AuthPage } from "@/components/auth-page";
import { MainApp } from "@/components/main-app";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <MainApp />;
}
