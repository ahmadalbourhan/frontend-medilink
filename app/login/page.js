"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isArabic, setIsArabic] = useState(false); // تبديل اللغة

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const toggleLanguage = () => {
    setIsArabic(!isArabic);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-secondary ${
        isArabic ? "text-right" : "text-left"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* تبديل اللغة */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 px-4 py-2 bg-[#00368c] text-white font-semibold rounded-full shadow hover:bg-[#4b7bc6] transition-all duration-300"
      >
        {isArabic ? "English" : "العربية"}
      </button>

      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isArabic ? "تسجيل الدخول" : "MediLink Login"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? "إدارة شاملة للسجلات الطبية"
              : "Comprehensive medical record management"}
          </p>
        </div>
        <LoginForm isArabic={isArabic} /> {/* تمرير اللغة اختياريًا */}
      </div>
    </div>
  );
}
