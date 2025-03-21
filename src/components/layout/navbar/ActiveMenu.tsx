"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface ActiveMenuProps {
  menuItems: { [key: string]: string };
}

const ActiveMenu: React.FC<ActiveMenuProps> = ({ menuItems }) => {
  const pathname = usePathname();
  const [active, setActive] = useState<number>(0);
  const menuRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (!pathname) return;

    const currentPath = pathname.toLowerCase();
    const activeIndex = Object.keys(menuItems).findIndex((key) =>
      currentPath.includes(key.toLowerCase())
    );

    if (activeIndex !== -1) {
      setActive(activeIndex);
    }
  }, [pathname, menuItems]);

  return (
    <ul className="flex space-x-8 text-gray-600 relative">
      {Object.entries(menuItems).map(([key, label], index) => (
        <li
          key={key}
          ref={(el) => {
            menuRefs.current[index] = el;
          }}
          onClick={() => setActive(index)}
          className={`cursor-pointer transition-colors duration-300 text-lg ${
            active === index ? "text-primary" : "hover:text-primary-light"
          }`}
        >
          <Link href={`/${key.toLowerCase()}`} passHref>
            <p>{label}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default ActiveMenu;
