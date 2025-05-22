import "./styles.css";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  LayoutDashboard,
  FileText,
  Flag,
  Users,
  Image,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";

import { authOptions } from "@/lib/auth";

// Admin dashboard layout component
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Check if user has admin or editor role
  // @ts-ignore - role is added by our custom session callback
  if (!["ADMIN", "EDITOR"].includes(session.user.role)) {
    // Redirect to unauthorized page or home
    redirect("/");
  }

  // @ts-ignore - role is added by our custom session callback
  const isAdmin = session.user.role === "ADMIN";

  // Define navigation items
  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Blog Posts",
      href: "/admin/posts",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Services",
      href: "/admin/services",
      icon: <Flag className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: "Team Members",
      href: "/admin/team",
      icon: <Users className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: "Media Library",
      href: "/admin/media",
      icon: <Image className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      adminOnly: true,
    },
  ];

  // Filter out admin-only items for editors
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="admin-layout">
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-blue-600">
            Medicare Dashboard
          </Link>
          <button className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="admin-sidebar hidden md:flex flex-col w-64">
          <div className="admin-sidebar-logo">
            <svg
              className="w-8 h-8 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" />
            </svg>
            Medicare Dashboard
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href} className="admin-nav-item">
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                {session.user.name?.[0] || "U"}
              </div>
              <div>
                <div className="font-medium">{session.user.name}</div>
                {/* @ts-ignore - role is added by our custom session callback */}
                <div className="text-xs text-gray-500">{session.user.role}</div>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md w-full transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-content flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
