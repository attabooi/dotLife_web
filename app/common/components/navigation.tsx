import { Link } from "react-router";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import {
  BarChart3,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  BellIcon,
  MessageCircleIcon,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PixelLogoCompact } from "./ui/pixel-logo";
import { PixelLogoText } from "./ui/pixel-logo";

const menus = [
  {
    name: "Quest",
    to: "/quests",
  },
  {
    name: "My Tower",
    to: "/tower",
  },
  {
    name: "Rank",
    to: "/rank",
  },
];

export default function Navigation({
  isLoggedIn,
  hasNotifications,
  hasMessages,
  username,
  avatar,
  name,
  
}: {
  isLoggedIn: boolean;
  hasNotifications: boolean;
  hasMessages: boolean;
  username?: string;
  avatar?: string;
  name?: string;
}) {
  return (
    <nav className="flex px-4 md:px-20 h-16 items-center justify-between backdrop-blur fixed top-0 left-0 right-0 z-50 bg-background/50">
      {/* Left Section - Logo and Navigation */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <img src="/dotLife_logo.svg" alt="dotLife" className="h-6 md:h-8 w-auto" />
          <span className="font-bold tracking-tighter text-base md:text-lg">dotLife</span>
        </Link>
        
        <Separator orientation="vertical" className="h-6 mx-2 md:mx-4 hidden sm:block" />
        
        {/* Navigation Menu - Always visible but compact on mobile */}
        <div className="flex items-center gap-1 md:gap-4 min-w-0">
          {menus.map((menu) => (
            <Link
              key={menu.name}
              to={menu.to}
              className="text-xs md:text-base font-medium hover:text-orange-500 transition-colors px-1 md:px-2 py-1 rounded whitespace-nowrap"
            >
              {menu.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Right Section - Profile */}
      <div className="flex px-0 items-center justify-end flex-shrink-0">
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {avatar ? (
                      <AvatarImage src={avatar} alt={name || username || "User"} />
                    ) : (
                      <AvatarFallback className="text-sm">
                        {name?.[0] || username?.[0] || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{name || "User"}</span>
                  <span className="text-xs text-muted-foreground">
                    @{username || "user"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to={`/users/${username}`}>
                      <UserIcon className="size-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/auth/logout">
                    <LogOutIcon className="size-4 mr-2" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth/join">Join</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
