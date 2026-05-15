import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps & { children?: React.ReactNode, iconClassName?: string }> = ({ 
  className, 
  iconClassName,
  showText = true, 
  children 
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center justify-center overflow-hidden shrink-0",
        !iconClassName && "w-10 h-10 sm:w-12 sm:h-12 shadow-2xl",
        iconClassName
      )}>
        <img 
          src="/logo.png" 
          alt="Globe Thrift Logo" 
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.fallback-g')) {
              const span = document.createElement('span');
              span.innerText = 'G';
              span.className = 'fallback-g text-white font-bold text-xl';
              parent.appendChild(span);
            }
          }}
        />
      </div>
      {showText && (
        <div className="text-left">
          <h1 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white leading-none uppercase font-display">GLOBE THRIFT</h1>
          <p className="text-[7px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-indigo-400 mt-0.5 sm:mt-1 font-bold">Thrift Protocol v2.0</p>
          {children}
        </div>
      )}
    </div>
  );
};
