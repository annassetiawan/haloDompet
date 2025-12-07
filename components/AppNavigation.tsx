"use client";

import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";

interface AppNavigationProps {
  onScanClick?: () => void;
}

export function AppNavigation({ onScanClick }: AppNavigationProps) {
  return (
    <>
      <div className="md:hidden">
        <BottomNav onScanClick={onScanClick} />
      </div>
      <DesktopNav onScanClick={onScanClick} />
    </>
  );
}
