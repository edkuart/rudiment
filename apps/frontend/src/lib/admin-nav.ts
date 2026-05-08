import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Users,
  CreditCard,
  BarChart2,
  Settings,
  Plus,
  List,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
  exact?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const adminNav: NavGroup[] = [
  {
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Courses",
        href: "/admin/courses",
        icon: BookOpen,
        children: [
          { label: "All Courses", href: "/admin/courses", icon: List, exact: true },
          { label: "New Course", href: "/admin/courses/new", icon: Plus },
        ],
      },
      {
        label: "Media Library",
        href: "/admin/media",
        icon: Video,
      },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Students", href: "/admin/students", icon: Users },
      { label: "Memberships", href: "/admin/memberships", icon: CreditCard },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];
