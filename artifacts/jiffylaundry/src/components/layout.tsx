import { Link, useLocation } from "wouter";
import { Home, CalendarPlus, Tag, User, LayoutDashboard, LogOut } from "lucide-react";
import { useUser, useClerk, Show } from "@clerk/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/schedule", label: "Schedule", icon: CalendarPlus },
    { href: "/offers", label: "Offers", icon: Tag },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">
      {/* Full-width black header bar */}
      <header className="bg-black sticky top-0 z-20 w-full overflow-hidden h-16">
        <div className="flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center h-full py-2">
            <img src="/jiffy-logo.png" alt="JiffyLaundry" className="h-full w-auto max-w-[160px] object-contain object-left" />
          </Link>

          {/* Desktop nav links in header */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <Show when="signed-in">
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === "/admin"
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            </Show>
          </nav>

          {/* Right side: user controls */}
          <div className="flex items-center gap-3">
            <Show when="signed-in">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-white/20 hover:border-white/40 transition-colors">
                    <AvatarFallback className="bg-primary text-white font-semibold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-900 border-b border-gray-100 mb-1 truncate">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer w-full flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                    onClick={() => signOut({ redirectUrl: basePath || "/" })}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Show>

            <Show when="signed-out">
              <Link href="/sign-in">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold">
                  Sign In
                </Button>
              </Link>
            </Show>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 w-full max-w-5xl mx-auto pb-20 md:pb-8 px-4 md:px-8 pt-6">
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
