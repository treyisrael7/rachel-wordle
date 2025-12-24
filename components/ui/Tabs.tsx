'use client';

import { ReactNode, useState, createContext, useContext, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within Tabs component');
  }
  return context;
}

interface TabsProps {
  tabs: { id: string; label: string }[];
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  children: (activeTab: string) => ReactNode;
}

export default function Tabs({ tabs, defaultTab, onTabChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Segmented Control */}
        <div 
          className="relative inline-flex w-full rounded-2xl p-1 overflow-hidden mb-4 shrink-0"
          style={{
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Active pill indicator - positioned behind buttons */}
          <div
            className={cn(
              'absolute inset-1 rounded-xl transition-transform pointer-events-none',
              prefersReducedMotion ? 'duration-0' : 'duration-200 ease-out'
            )}
            style={{
              backgroundColor: 'var(--primary)',
              width: `calc((100% - 0.5rem) / ${tabs.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'relative z-10 flex-1 rounded-xl px-3 py-2 text-sm font-medium leading-none transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content with transition */}
        <div
          ref={contentRef}
          className={cn(
            'relative flex-1 flex flex-col min-h-0',
            prefersReducedMotion ? '' : 'transition-all duration-200 ease-out'
          )}
        >
          <div
            key={activeTab}
            className="flex-1 flex flex-col min-h-0"
          >
            {children(activeTab)}
          </div>
        </div>
      </div>
    </TabsContext.Provider>
  );
}
