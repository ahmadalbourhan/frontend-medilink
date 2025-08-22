"use client";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Users,
  UserCheck,
  FileText,
  Building2,
  LogOut,
  Activity,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext"; // <-- Add this

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  const { isArabic, toggleLanguage } = useLanguage(); // <-- Use context

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize theme from localStorage
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enableDark = stored ? stored === "dark" : prefersDark;
    setIsDark(enableDark);
    if (enableDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navigation =
    user?.role === "admin"
      ? [
          { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
          { name: "Institutions", href: "/institutions", icon: Building2 },
          { name: "Users", href: "/users", icon: Users },
        ]
      : user?.role === "admin_institutions"
      ? [
          { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
          { name: "Patients", href: "/patients", icon: Users },
          { name: "Doctors", href: "/doctors", icon: UserCheck },
          { name: "Medical Records", href: "/medical-records", icon: FileText },
        ]
      : user?.role === "doctor"
      ? [{ name: "Patients", href: "/patients", icon: Users }]
      : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Icon-only sidebar for small and medium screens */}
      <div className="fixed inset-y-0 left-0 z-50 w-16 bg-card border-r border-border lg:hidden">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-border">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                  } group flex items-center justify-center w-12 h-12 rounded-md transition-colors`}
                  title={item.name}
                >
                  <IconComponent className="w-6 h-6" />
                </Link>
              );
            })}
          </nav>
          <div className="p-2 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-12 h-12 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title={isArabic ? "تسجيل الخروج" : "Logout"}
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Full sidebar for large screens */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-card border-r border-border">
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            handleLogout={handleLogout}
            isArabic={isArabic} // <-- Pass down
          />
        </div>
      </div>

      {/* Main content */}
      <div className="pl-16 lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-foreground">
                  {isArabic
                    ? "نظام السجلات الطبية"
                    : "Your Secure Medical CV System"}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {/* {isArabic ? `مرحبا، ${user?.name}` : `Welcome, ${user?.name}`} */}
                </span>

                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="inline-flex items-center justify-center rounded-md border border-border p-2 text-muted-foreground hover:bg-accent/10"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>

                {/* Language toggle */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="inline-flex items-center justify-center rounded-md border border-border p-2 text-muted-foreground hover:bg-accent/10"
                >
                  {isArabic ? "English" : "العربية"}
                </button>

                {/* Logout for small screens */}
                <button
                  onClick={handleLogout}
                  className="bg-destructive text-white px-4 py-2 rounded-md text-sm lg:hidden hover:bg-destructive/90"
                >
                  {isArabic ? "تسجيل الخروج" : "Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation, pathname, handleLogout, isArabic }) {
  return (
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <h2 className="text-lg font-semibold text-foreground">MediLink</h2>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {isArabic ? "تسجيل الخروج" : "Logout"}
        </button>
      </div>
    </div>
  );
}
