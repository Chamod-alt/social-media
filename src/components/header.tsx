"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message,
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            SocialVerse
          </h1>
        </div>
        {user && (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
