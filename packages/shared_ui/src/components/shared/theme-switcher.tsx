import { ReactNode } from "react";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../ui/dropdown-menu";

import { useThemeContext } from "@mono/shared_ui/provider/theme-provider";
import { MonitorCog, Moon, Sun } from "lucide-react";

type Props = {
  isMobile: boolean;
  asChild?: boolean;
  children: ((darkMode: boolean) => React.ReactNode) | React.ReactNode;
  className?: string;
};

const ThemeSwitcher = ({ children, asChild, className }: Props) => {
  const { darkTheme, toggleTheme } = useThemeContext();
  let renderItem = children;
  if (typeof children === "function") {
    renderItem = children(darkTheme);
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger asChild={asChild} className={className}>
        {renderItem as ReactNode}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toggleTheme("dark")}
            >
              <Moon />
              Dark
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => toggleTheme("light")}
          >
            <Sun />
            Light
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toggleTheme()}
            >
              <MonitorCog />
              System
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export default ThemeSwitcher;
