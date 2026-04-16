"use client";

import { ComponentProps, ReactNode, forwardRef, ElementRef, useEffect, useRef, useState } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  const [activeValue, setActiveValue] = useState(props.defaultValue || props.value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleValueChange = (newValue: string) => {
    if (newValue === activeValue || isAnimating) return;
    
    // Сохраняем текущую высоту контента
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight);
    }
    
    setIsAnimating(true);
    
    // Сначала удаляем старый контент
    setActiveValue(null);
    
    // Через 500мс создаем новый контент
    setTimeout(() => {
      setActiveValue(newValue);
      if (props.onValueChange) {
        props.onValueChange(newValue);
      }
      
      // Через еще 500мс убираем фиксированную высоту и разрешаем следующее переключение
      setTimeout(() => {
        setContentHeight(null);
        setIsAnimating(false);
      }, 500);
    }, 500);
  };

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2 relative", className)}
      {...props}
      value={activeValue as string}
      onValueChange={handleValueChange}
    >
      {props.children}
      <div 
        ref={contentRef}
        style={contentHeight ? { minHeight: `${contentHeight}px` } : undefined}
        className="relative"
      >
        {isAnimating && !activeValue && (
          <div className="absolute inset-0 flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}
      </div>
    </TabsPrimitive.Root>
  );
}

function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateIndicator = () => {
      if (!listRef.current) return;
      
      const activeTab = listRef.current.querySelector('[data-state="active"]') as HTMLElement;
      if (activeTab) {
        const listRect = listRef.current.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        
        setIndicatorStyle({
          left: tabRect.left - listRect.left,
          width: tabRect.width,
        });
      }
    };

    updateIndicator();
    
    // Наблюдаем за изменениями в DOM
    const observer = new MutationObserver(updateIndicator);
    if (listRef.current) {
      observer.observe(listRef.current, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-state'],
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex relative",
        className,
      )}
      {...props}
    >
      {/* Анимированный индикатор */}
      <div
        className="absolute h-[calc(100%-6px)] bg-white dark:bg-input/30 rounded-xl transition-all duration-1000 ease-in-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />
      {props.children}
    </TabsPrimitive.List>
  );
}

function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 data-[state=active]:text-foreground dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "transition-colors duration-300",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        "data-[state=active]:animate-fade-in",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

