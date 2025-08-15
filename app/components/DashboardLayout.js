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
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Doctors", href: "/doctors", icon: UserCheck },
    { name: "Medical Records", href: "/medical-records", icon: FileText },
    // Only show institutions tab for admin users, not admin_institutions
    ...(user?.role === "admin"
      ? [{ name: "Institutions", href: "/institutions", icon: Building2 }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Icon-only sidebar for small and medium screens */}
      <div className="fixed inset-y-0 left-0 z-50 w-16 bg-white border-r border-gray-200 lg:hidden">
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Activity className="w-8 h-8 text-blue-600" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center justify-center w-12 h-12 rounded-md transition-colors`}
                  title={item.name}
                >
                  <IconComponent className="w-6 h-6" />
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-12 h-12 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Full sidebar for large screens */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="pl-16 lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Medical CV System
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 lg:hidden"
                >
                  Logout
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

function SidebarContent({ navigation, pathname, handleLogout }) {
  return (
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <h2 className="text-lg font-semibold text-gray-900">Medical CV</h2>
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
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
