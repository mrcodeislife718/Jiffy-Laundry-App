import { Link, useLocation } from "wouter";
import { Home, CalendarPlus, Tag, User } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/schedule", label: "Schedule", icon: CalendarPlus },
    { href: "/offers", label: "Offers", icon: Tag },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 pb-16 md:pb-0 md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            Jiffy<span className="text-gray-900">Laundry</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto pb-8 md:p-8 relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
          <Link href="/" className="text-xl font-bold text-primary">
            Jiffy<span className="text-gray-900">Laundry</span>
          </Link>
        </div>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? "bg-primary/10" : ""}`}>
                <item.icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
              </div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}