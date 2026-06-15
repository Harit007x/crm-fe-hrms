import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import type { SideNavItem } from "@/utils/types";
import { Icons } from "./icons";

const MenuItem = ({ item }: { item: SideNavItem }) => {
  const { pathname } = useLocation();
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  if (item.submenu) {
    return (
      <div className="w-full">
        <button
          onClick={toggleSubMenu}
          className={clsx(
            "relative flex flex-row items-center gap-2 rounded-lg p-2 w-full text-start transition-colors hover:bg-accent hover:text-accent-foreground/80 [&_svg]:size-4 [&_svg]:shrink-0",
            {
              "bg-primary/10 text-primary": pathname.includes(item.path),
              "text-muted-foreground": !pathname.includes(item.path),
            }
          )}
        >
          {item.icon && (
            <span className="size-4 shrink-0 flex items-center justify-center">
              {item.icon}
            </span>
          )}
          <span className="font-medium text-sm flex-1 text-start">
            {item.title}
          </span>
          <Icons.chevronDown
            className={clsx("transition-transform size-4 shrink-0", {
              "rotate-180": subMenuOpen,
            })}
          />
        </button>

        {subMenuOpen && (
          <div className="ml-2 mt-1 flex flex-col gap-1">
            {item.subMenuItems?.map((subItem, idx) => (
              <Link
                key={idx}
                to={subItem.path}
                className={clsx(
                  "relative flex flex-row items-center gap-2 rounded-lg p-2 ps-8 text-sm transition-colors hover:bg-accent hover:text-accent-foreground/80 [&_svg]:size-4 [&_svg]:shrink-0",
                  {
                    "bg-primary/10 text-primary": isActive(subItem.path),
                    "text-muted-foreground": !isActive(subItem.path),
                  }
                )}
              >
                {subItem.icon && (
                  <span className="size-4 shrink-0 flex items-center justify-center">
                    {subItem.icon}
                  </span>
                )}
                <span>{subItem.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      aria-current={isActive(item.path) ? "page" : undefined}
      className={clsx(
        "relative flex flex-row items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors [overflow-wrap:anywhere] [&_svg]:size-4 [&_svg]:shrink-0",
        {
          "bg-primary/10 font-semibold text-primary": isActive(item.path),
          "font-medium text-muted-foreground hover:bg-accent hover:text-foreground":
            !isActive(item.path),
        }
      )}
    >
      {item.icon && (
        <span className="size-4 shrink-0 flex items-center justify-center">
          {item.icon}
        </span>
      )}
      <span className="text-sm">{item.title}</span>
    </Link>
  );
};

export default MenuItem;
