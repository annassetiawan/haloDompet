"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, BarChart3, Sparkles, Camera } from "lucide-react";
import { Dock, DockIcon } from "@/components/ui/dock";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DesktopNavProps {
  onScanClick?: () => void;
}

// Separator component that ignores Dock props (mouseX, magnification, etc.)
const DockSeparator = ({ ...props }: any) => {
  return <div className="h-8 w-[1px] bg-border mx-1 self-center" />;
};

export function DesktopNav({ onScanClick }: DesktopNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/budget",
      label: "Budget",
      icon: Target,
    },
    {
      href: "/advisor",
      label: "Advisor",
      icon: Sparkles,
    },
    {
      href: "/reports",
      label: "Laporan",
      icon: BarChart3,
    },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none">
      <TooltipProvider>
        <Dock className="pointer-events-auto bg-background/80 border-border shadow-lg">
          {navItems.map((item) => (
            <DockIcon key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-full w-full items-center justify-center rounded-full transition-colors hover:bg-muted",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}

          {/* Separator */}
          <DockSeparator />

          {/* Scan Button */}
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full w-full rounded-full hover:bg-muted"
                  onClick={onScanClick}
                  disabled={!onScanClick}
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Scan Struk</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>
    </div>
  );
}
