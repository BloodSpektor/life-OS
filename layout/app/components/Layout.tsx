import { Outlet, NavLink } from "react-router";
import { Home, Refrigerator, Apple, Wallet, Bell, BarChart3 } from "lucide-react";

export function Layout() {
  const navItems = [
    { to: "/", label: "Главная", icon: Home },
    { to: "/fridge", label: "Холодильник", icon: Refrigerator },
    { to: "/nutrition", label: "Питание", icon: Apple },
    { to: "/expenses", label: "Траты", icon: Wallet },
    { to: "/reminders", label: "Уведомления", icon: Bell },
    { to: "/statistics", label: "Статистика", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Apple className="h-8 w-8 text-green-600" />
              <span className="text-xl font-semibold text-gray-900">HealthTracker</span>
            </div>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
