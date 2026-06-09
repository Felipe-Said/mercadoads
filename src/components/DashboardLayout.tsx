import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const location = useLocation()

  return (
    <div className="bg-[#ededed] min-h-[calc(100vh-100px)]">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-md shadow-sm p-4 sticky top-24">
            <h2 className="text-xl font-medium text-ml-dark mb-4 px-3">{title}</h2>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors ${
                      isActive 
                        ? 'bg-ml-blue/10 text-ml-blue font-semibold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-ml-dark'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
        
      </div>
    </div>
  )
}
