import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  const isControlled = typeof value === "string";
  const currentValue = isControlled ? value : internalValue;

  const setValue = useCallback(
    (val) => {
      if (!isControlled) setInternalValue(val);
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  const ctx = useMemo(() => ({ value: currentValue, setValue }), [currentValue, setValue]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      role="tablist"
      className={
        className ??
        "inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 backdrop-blur p-1"
      }
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => ctx.setValue(value)}
      className={
        className ??
        `rounded-full px-4 py-2 text-sm transition-colors data-[state=active]:bg-foreground data-[state=active]:text-background text-foreground/70 hover:text-foreground`
      }
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}

export default Tabs;
