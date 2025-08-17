"use client";

import { Button } from "@/components/ui/button";
import { Activity, Heart, Shield, Users, FileText, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Secure Records",
      description:
        "Your medical data is protected with enterprise-grade security",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Patient Management",
      description: "Efficiently manage and track patient information",
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Digital Records",
      description: "Convert paper records into organized digital files",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Quick Access",
      description: "Instant access to medical history and records",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 z-0" />

        <div className="container mx-auto px-4">
          <div className="relative z-10 py-20 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex items-center space-x-3 animate-slide-in-left">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                  <Heart className="h-8 w-8 text-accent animate-pulse" />
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl font-bold">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      MedicalCV
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
                    Transform your medical practice with our comprehensive
                    digital health records management system
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button
                    size="lg"
                    onClick={handleLogin}
                    className="bg-primary hover:bg-accent transition-all duration-300 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Button>
                </div>
              </div>

              <div className="hidden md:block relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full filter blur-3xl animate-pulse"></div>
                <img
                  src="/health-hero.png"
                  alt="Medical Healthcare Illustration"
                  className="relative w-full max-w-lg mx-auto transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose MedicalCV?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of medical record management with our
              comprehensive solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-3 bg-primary/10 rounded-lg inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
