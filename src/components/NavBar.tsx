"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavBarProps {
  className?: string;
}

interface MenuItem {
  label: string;
  href: string;
}

const dataMethodsItems: MenuItem[] = [
  { label: "Data Collection", href: "/data-collection" },
  { label: "Data Processing", href: "/data-processing" },
  { label: "Analysis Methods", href: "/analysis-methods" },
  { label: "Validation", href: "/validation" },
];

export function NavBar({ className }: NavBarProps) {
  const [currentLanguage, setCurrentLanguage] = React.useState("EN");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full shadow bg-neutral-100",
        className,
      )}
    >
      <div className="w-full py-2 px-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-lg overflow-hidden">
              <Image
                src="/images/epistem-logo.webp"
                alt="Epistem Logo"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-medium text-black font-inter">
              Epistem-X
            </h1>
          </div>

          {/* Navigation and Language Picker */}
          <div className="flex items-center space-x-10">
            {/* Navigation Menu */}
            <nav className="flex items-center space-x-8">
              {/* Data and Methods Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 font-lato text-md font-regular text-muted-foreground transition-colors hover:text-foreground">
                  <span>Data and Methods</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {dataMethodsItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <a href={item.href}>{item.label}</a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Other Menu Items */}
              <a
                href="/launch-tool"
                className="font-lato text-md font-regular text-muted-foreground transition-colors hover:text-foreground"
              >
                Launch Tool
              </a>
              <a
                href="/map-utilization"
                className="font-lato text-md font-regular text-muted-foreground transition-colors hover:text-foreground"
              >
                Map Utilization
              </a>
            </nav>

            {/* Language Picker */}
            <div className="flex items-center space-x-2.5 bg-[#FFF6FE] p-2.5">
              <button
                onClick={() => setCurrentLanguage("EN")}
                className={cn(
                  "p-0 text-md font-inter font-medium transition-colors",
                  currentLanguage === "EN"
                    ? "text-[#CC4778] font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                EN
              </button>
              <div className="h-4 w-px bg-border" />
              <button
                onClick={() => setCurrentLanguage("ID")}
                className={cn(
                  "p-0 text-md font-inter font-medium transition-colors",
                  currentLanguage === "ID"
                    ? "text-[#CC4778] font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ID
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
