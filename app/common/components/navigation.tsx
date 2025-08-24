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
    <nav className="flex px-20 h-16 items-center justify-between backrop-blur fixed top-0 left-0 right-0 z-50 bg-background/50">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/dotLife_logo.svg" alt="dotLife" className="h-8 w-auto" />
          <span className="font-bold tracking-tighter text-lg">dotLife</span>
          {/* <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <PixelLogoCompact size="md" />
          <PixelLogoText size="md" /> */}
        </Link>
        
        <Separator orientation="vertical" className="h-6 mx-4" />
        <NavigationMenu>
          <NavigationMenuList>
            {menus.map((menu) => (
              <NavigationMenuItem key={menu.name}>
                {menu.items ? (
                  <>
                    <Link to={menu.to}>
                      <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
                    </Link>
                    <NavigationMenuContent>
                      <ul className="grid w-[600px] font-light gap-3 p-4 grid-cols-2">
                        {menu.items?.map((item) => (
                          <NavigationMenuItem
                            key={item.name}
                            className={cn(
                              "select-none rounded-md transition-colors focus:bg-accent hover:bg-accent",
                              (item.to === "/products/promote" ||
                                item.to === "/jobs/submit") &&
                                "col-span-2 bg-primary/10 hover:bg-primary/20 focus:bg-primary/20"
                            )}
                          >
                            <NavigationMenuLink asChild>
                              <Link
                                className="p-3 space-y-1 block leading-none no-underline outline-none"
                                to={item.to}
                              >
                                <span className="text-sm font-medium leading-none">
                                  {item.name}
                                </span>
                                <p className="text-sm leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link className={navigationMenuTriggerStyle()} to={menu.to}>
                      {menu.name}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          {/* 알람과 메시지 버튼 숨김 */}
          {/* <Button size="icon" variant="ghost" asChild className="relative">
            <Link to="/my/notifications">
              <BellIcon className="size-4" />
              {hasNotifications && (
                <div className="absolute right-1.5 top-1.5   rounded-full size-2 bg-red-500 text-xs w-2 h-2" />
              )}
            </Link>
          </Button>
          <Button size="icon" variant="ghost" asChild className="relative">
            <Link to="/my/messages">
              <MessageCircleIcon className="size-4" />
              {hasMessages && (
                <div className="absolute right-1.5 top-1.5 rounded-full size-2 bg-red-500 text-xs w-2 h-2" />
              )}
            </Link>
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
              {avatar ? (
                  <AvatarImage src={avatar} />
                ) : (
                  <AvatarFallback>{name?.[0]}</AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">
                  @{username}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {/* Dashboard와 Settings 메뉴 숨김 */}
                {/* <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/my/dashboard">
                    <BarChart3 className="size-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to={`/users/${username}`}>
                    <UserIcon className="size-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/my/settings">
                    <SettingsIcon className="size-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem> */}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/auth/logout">
                  <LogOutIcon className="size-4 mr-2" />
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>{" "}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button asChild variant="secondary">
            <Link to="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/join">Join</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
