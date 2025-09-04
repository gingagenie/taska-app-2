"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Briefcase, Users, Wrench, UserCheck, Calendar, FileText, Receipt, Crown } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Equipment", href: "/equipment", icon: Wrench },
  { name: "Teams", href: "/teams", icon: UserCheck },
  { name: "Members", href: "/members", icon: Users },
  { name: "Schedule", href: "/", icon: Calendar },
  { name: "Quotes", href: "/quotes", icon: FileText, isPro: true },
  { name: "Invoices", href: "/invoices", icon: Receipt, isPro: true },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Taska</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
              {item.isPro && (
                <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                  PRO
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Field Service Pro</p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center">
            <Crown className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">Unlock quotes, invoices, and advanced features</p>
        </div>
      </div>
    </div>
  )
}
