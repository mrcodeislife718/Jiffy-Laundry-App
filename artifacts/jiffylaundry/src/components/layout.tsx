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
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 pb-16 md:pb-0 md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-5">
          <Link href="/" className="flex items-center">
            <img src="/jiffy-logo.png" alt="JiffyLaundry" className="h-14 w-auto object-contain" />
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
          
          <Show when="signed-in">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                location === "/admin"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Admin
            </Link>
          </Show>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <Show when="signed-in">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="h-9 w-9 bg-primary/10 text-primary">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="truncate">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut({ redirectUrl: basePath || "/" })} title="Sign out">
                <LogOut className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button className="w-full">Sign In</Button>
            </Link>
          </Show>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto pb-8 md:p-8 relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
          <Link href="/" className="flex items-center">
            <img src="/jiffy-logo.png" alt="JiffyLaundry" className="h-10 w-auto object-contain" />
          </Link>
          
          <Show when="signed-in">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 bg-primary/10 text-primary cursor-pointer border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium text-gray-900 border-b border-gray-100 mb-1 truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer w-full flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              Sign In
            </Link>
          </Show>
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