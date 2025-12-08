"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowDown, ArrowUp, MoreHorizontal, Edit2, ArrowRightLeft, Hand } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { MonthlyStats, Wallet } from '@/types';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface TotalBalanceCardProps {
  totalBalance: number;
  monthlyStats: MonthlyStats;
  wallets: Wallet[];
  onTransfer?: (wallet: Wallet) => void;
  onAdjustBalance?: (wallet: Wallet) => void;
}

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  totalBalance,
  monthlyStats,
  wallets,
  onTransfer,
  onAdjustBalance
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [orderedWallets, setOrderedWallets] = useState<Wallet[]>([]);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Initialize with props
  useEffect(() => {
    if (wallets.length > 0) {
      setOrderedWallets(wallets);
      // Show hint if multiple wallets exist
      if (wallets.length > 1) {
        const timer = setTimeout(() => setShowSwipeHint(true), 1000);
        return () => clearTimeout(timer);
      }
    } else {
      setOrderedWallets([{ id: 'default', name: 'Wallet', balance: 0, is_default: true, user_id: '', created_at: '', updated_at: '' }]);
    }
  }, [wallets]);

  const removeHint = () => {
    if (showSwipeHint) setShowSwipeHint(false);
  };

  const rotateNext = () => {
    removeHint();
    setOrderedWallets(prev => {
      const newOrder = [...prev];
      const first = newOrder.shift();
      if (first) newOrder.push(first);
      return newOrder;
    });
  };

  const rotatePrev = () => {
    removeHint();
    setOrderedWallets(prev => {
      const newOrder = [...prev];
      const last = newOrder.pop();
      if (last) newOrder.unshift(last);
      return newOrder;
    });
  };

  const handleCardClick = (index: number) => {
    removeHint();
    if (index === 0) return; 
    // If clicking a specific back card, bring it to front
    const newOrder = [...orderedWallets];
    const [selected] = newOrder.splice(index, 1);
    newOrder.unshift(selected);
    setOrderedWallets(newOrder);
  };

  // Calculate swipe power to determine intent (combines distance and velocity)
  const swipeConfidenceThreshold = 3000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    removeHint();
    const swipe = swipePower(info.offset.x, info.velocity.x);

    // Trigger if swipe power is high OR if dragged far enough (> 100px)
    if (swipe < -swipeConfidenceThreshold || info.offset.x < -100) {
      // Swipe Left -> Next Card
      rotateNext();
    } else if (swipe > swipeConfidenceThreshold || info.offset.x > 100) {
      // Swipe Right -> Previous Card
      rotatePrev();
    }
  };

  return (
    <div className="relative w-[340px] h-[290px] font-sans select-none group">
      
      {/* 
        -------------------------------------------
        Deepest Card Layer (Wallet Backing Body)
        -------------------------------------------
      */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[250px] bg-white dark:bg-[#101010] rounded-t-[32px] rounded-b-[32px] z-0 border border-gray-200 dark:border-white/5 shadow-2xl transition-colors duration-300">
      </div>

      {/* 
        -------------------------------------------
        Interactive Card Stack
        -------------------------------------------
      */}
      <div className="absolute inset-x-0 top-0 h-full z-10">
        {orderedWallets.slice(0, 3).map((wallet, index) => {
           const topOffset = 14 - (index * 8); 
           const scale = 1 - (index * 0.05);
           const zIndex = 30 - (index * 10);
           
           const bgColor = index === 0 
             ? 'bg-white dark:bg-[#1a1a1a]' 
             : 'bg-gray-100 dark:bg-[#222]';
             
           const textColor = 'text-gray-900 dark:text-white';
           const labelColor = 'text-gray-400 dark:text-gray-500';

           // FIX: Always enable drag="x" but control dragListener based on index.
           // This prevents Framer Motion from getting stuck when props change.
           const isDraggable = index === 0;

           return (
            <motion.div 
              key={wallet.id}
              onClick={() => handleCardClick(index)}
              drag="x"  // Always allow horizontal drag capability
              dragListener={isDraggable} // But only listen to events if it's the top card
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7} 
              onDragStart={removeHint}
              onDragEnd={isDraggable ? handleDragEnd : undefined}
              animate={{
                top: topOffset,
                scale: scale,
                zIndex: zIndex,
                x: "-50%", // Always center horizontally in layout
                opacity: 1
              }}
              initial={false}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`absolute left-1/2 w-[300px] h-[230px] rounded-[24px] shadow-[0_-4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-white/5 cursor-pointer
                ${bgColor}
                ${index !== 0 ? 'hover:-translate-y-2' : ''}
              `}
            >
              {/* Swipe Hint Overlay (On top card only, if multiple wallets exist) */}
              {index === 0 && showSwipeHint && wallets.length > 1 && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm shadow-lg"
                   >
                     <motion.div
                       animate={{ x: [-10, 10, -10] }}
                       transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                     >
                       <Hand className="w-5 h-5" />
                     </motion.div>
                     <span className="text-xs font-medium">Geser</span>
                   </motion.div>
                 </div>
               )}

              {/* More Actions Button (Only Front Card) */}
              {index === 0 && (
                <div 
                  className="absolute top-4 right-4 z-50 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-48 z-[60]">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => onAdjustBalance?.(wallet)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Sesuaikan Saldo</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => onTransfer?.(wallet)}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            <span>Transfer</span>
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              )}

              <div className="pt-5 px-6 pointer-events-none"> 
                {/* Pointer events none on content to prevent interfering with drag? No, text selection maybe. */}
                <p className={`text-[10px] ${labelColor} font-bold tracking-[0.15em] uppercase mb-1`}>
                  {index === 0 ? 'Utama' : 'Tersimpan'}
                </p>
                <h2 className={`text-xl font-extrabold ${textColor} tracking-wide truncate mb-1`}>
                  {wallet.name}
                </h2>
                <p className={`text-sm ${labelColor} font-medium tracking-wide`}>
                  {showBalance ? formatCurrency(wallet.balance) : '•••••••••••'}
                </p>
              </div>
            </motion.div>
           );
        })}
      </div>

      {/* 
        -------------------------------------------
        Front Pocket Layer (Total Keuangan)
        -------------------------------------------
      */}
      <div className="absolute bottom-0 w-full h-[220px] z-40 filter drop-shadow-[0_-8px_24px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_-8px_24px_rgba(0,0,0,0.9)] transition-all duration-300 pointer-events-none">
        <div className="relative w-full h-full">
            <svg 
              className="absolute top-0 left-0 w-full h-full overflow-visible"
              viewBox="0 0 340 220"
              preserveAspectRatio="none"
            >
                {/* Pocket Shape */}
                <path 
                    d="M0,45 Q170,90 340,45 V196 C340,209.255 329.255,220 316,220 H24 C10.7452,220 0,209.255 0,196 Z" 
                    className="fill-white dark:fill-[#0a0a0a] transition-colors duration-300"
                />
                
                {/* Decorative Stitching */}
                <path 
                    d="M12,53 Q170,97 328,53 V196 C328,205 322,210 314,210 H26 C18,210 12,205 12,196 Z" 
                    fill="none" 
                    className="stroke-gray-300 dark:stroke-[#333] transition-colors duration-300"
                    strokeOpacity="0.8" 
                    strokeWidth="1.5" 
                    strokeDasharray="6 6"
                />
            </svg>

            {/* Content Container */}
            <div className="absolute inset-0 pt-[96px] px-8 flex flex-col justify-start pointer-events-auto">
                
                {/* Balance Section */}
                <div className="flex flex-col mb-5">
                    <div className="flex items-center gap-2 group/text cursor-pointer w-fit mb-2" onClick={() => setShowBalance(!showBalance)}>
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider group-hover/text:text-gray-600 dark:group-hover/text:text-gray-400 transition-colors uppercase">Total Keuangan</span>
                        <div className="text-gray-400 dark:text-gray-500 group-hover/text:text-gray-900 dark:group-hover/text:text-white transition-colors">
                            {showBalance ? <EyeOff size={12} /> : <Eye size={12} />}
                        </div>
                    </div>
                    <div className="text-[28px] font-black text-gray-900 dark:text-white tracking-tight leading-none transition-colors duration-300">
                        {showBalance ? formatCurrency(totalBalance) : '•••••••••••'}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="flex items-center gap-10 pl-1">
                    {/* Income */}
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#05c24e] flex items-center justify-center shadow-[0_0_10px_rgba(5,194,78,0.3)]">
                            <ArrowDown size={12} className="text-white dark:text-black stroke-[3]" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300 tracking-wide transition-colors duration-300">
                          {formatCurrency(monthlyStats?.income || 0)}
                        </span>
                    </div>

                    {/* Expense */}
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#d82828] flex items-center justify-center shadow-[0_0_10px_rgba(216,40,40,0.3)]">
                            <ArrowUp size={12} className="text-white dark:text-black stroke-[3]" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300 tracking-wide transition-colors duration-300">
                          {formatCurrency(monthlyStats?.expense || 0)}
                        </span>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
