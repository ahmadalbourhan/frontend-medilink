"use client";

import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center space-x-3">
          <Activity className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">MedicalCV</h1>
        </div>

        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Professional medical CV management system
        </p>

        <Button
          size="lg"
          onClick={handleLogin}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Login
        </Button>
      </div>
    </div>
  );
}
