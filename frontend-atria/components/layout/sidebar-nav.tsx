"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { canAccessRoute } from "@/lib/navigation-access";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  navSections,
  leadsRoutes,
  settingsRoutes,
} from "./navigation";

interface SidebarNavProps {
  onNavigate?: () => void;
  className?: string;
  collapsed?: boolean;
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/creation") {
    return (
      pathname === "/creation" ||
      pathname.startsWith("/content/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  onNavigate,
  className,
  collapsed = false,
}: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const visibleSections = useMemo(() => {
    return navSections
      .map((section) => ({
        ...section,
        items: section.items
          .map((item) => {
            if (!item.children?.length) {
              return canAccessRoute(user?.role, item.href, user?.permissions)
                ? item
                : null;
            }

            const children = item.children.filter((child) =>
              canAccessRoute(user?.role, child.href, user?.permissions),
            );

            if (children.length === 0) {
              return null;
            }

            return { ...item, children };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null),
      }))
      .filter((section) => section.items.length > 0);
  }, [user?.permissions, user?.role]);

  useEffect(() => {
    if (collapsed) {
      setOpenDropdowns(new Set());
      return;
    }

    const next = new Set<string>();

    if (settingsRoutes.some((href) => isRouteActive(pathname, href))) {
      next.add("Configurações");
    }

    if (leadsRoutes.some((href) => isRouteActive(pathname, href))) {
      next.add("Leads");
    }

    setOpenDropdowns(next);
  }, [pathname, collapsed]);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <nav
      className={cn(
        "flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "gap-2" : "gap-6",
        className,
      )}
    >
      {visibleSections.map((section) => (
        <div key={section.label}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-white/35 opacity-100 transition-opacity duration-300 ease-in-out">
              {section.label}
            </p>
          )}

          <div
            className={cn(
              "flex flex-col",
              collapsed ? "items-center gap-1" : "gap-0.5",
            )}
          >
            {section.items.map((item) => {
              const Icon = item.icon;
              const hasChildren = Boolean(item.children?.length);
              const isOpen = openDropdowns.has(item.name);
              const active =
                isRouteActive(pathname, item.href) ||
                (hasChildren &&
                  item.children?.some((child) =>
                    isRouteActive(pathname, child.href),
                  ));

              const iconClass = cn(
                "shrink-0 transition-colors",
                active
                  ? "text-[#E8C39E]"
                  : "text-white/50 group-hover:text-white/80",
              );

              const itemClass = cn(
                "group flex items-center rounded-lg text-sm font-medium transition-all duration-150",
                collapsed
                  ? "size-10 justify-center"
                  : "w-full gap-3 px-3 py-2.5",
                active
                  ? collapsed
                    ? "border border-[#E8C39E]/40 bg-white/10 text-white"
                    : "border-l-4 border-[#E8C39E] bg-white/10 pl-2.5 text-white"
                  : collapsed
                    ? "border border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                    : "border-l-4 border-transparent text-white/70 hover:bg-white/5 hover:text-white",
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger
                      render={
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={itemClass}
                          aria-label={item.name}
                        />
                      }
                    >
                      <Icon size={18} className={iconClass} />
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  </Tooltip>
                );
              }

              if (hasChildren) {
                return (
                  <div key={item.name} className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.name)}
                      className={cn(itemClass, "justify-between")}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={iconClass} />
                        <span className="opacity-100 transition-opacity duration-300 ease-in-out">
                          {item.name}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        className={cn(
                          "text-white/40 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="relative ml-5 flex flex-col gap-0.5 border-l border-white/10 py-1 pl-3">
                        {item.children?.map((child) => {
                          const childActive = isRouteActive(
                            pathname,
                            child.href,
                          );

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onNavigate}
                              className={cn(
                                "rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-150",
                                childActive
                                  ? "bg-white/10 text-[#E8C39E]"
                                  : "text-white/55 hover:bg-white/5 hover:text-white/90",
                              )}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={itemClass}
                >
                  <Icon size={18} className={iconClass} />
                  <span className="opacity-100 transition-opacity duration-300 ease-in-out">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
