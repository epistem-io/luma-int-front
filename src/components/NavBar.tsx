"use client";

import { useContext } from "react";
import Image from "next/image";
// import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import LanguageToggle from "./LanguageToggle";
import { Button } from "./ui/button";

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
  const t = useTranslations("LoginModal");
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { setIsLoginModalOpen } = useContext(GlobalContext);

  return (
    <nav
      className={cn("z-50 w-full bg-white", className)}
      // className={cn("sticky top-0 z-50 w-full bg-neutral-100", className)}
    >
      <div className="w-full py-2 px-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link href="/">
            <div className="flex items-center space-x-3">
              <div className="flex h-12.5 w-12.5 items-center justify-center rounded-lg overflow-hidden">
                <Image
                  src="/images/logo-epistem.webp"
                  alt="Epistem Logo"
                  width={270}
                  height={265}
                  className="object-contain h-12.5 w-12.5"
                  priority
                />
              </div>
              <div className="space-y-0">
                <h1 className="text-4xl leading-8 tracking-[1.44px] font-medium text-[#0F0A83] font-degular-display-demo">
                  Luma
                </h1>
                <h2 className="text-[14px] leading-3.5 tracking-[0.28px] font-medium text-[#0F0A83] font-degular-display-demo">
                  Land Use Mapping for All
                </h2>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-5">
            {/* <nav className="flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 font-lato text-md font-regular text-neutral-700-baru transition-colors hover:text-foreground hover:cursor-pointer">
                  <span>Data and Methods</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="">
                  {dataMethodsItems.map((item) => (
                    <div key={item.href}>
                      <Link href={item.href}>
                        <DropdownMenuItem className="hover:cursor-pointer">
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/launch-tool"
                className="font-lato text-md font-regular text-neutral-700-baru transition-colors hover:text-foreground"
              >
                Launch Tool
              </Link>
              <Link
                href="/map-utilization"
                className="font-lato text-md font-regular text-neutral-700-baru transition-colors hover:text-foreground"
              >
                Map Utilization
              </Link>
            </nav> */}

            <LanguageToggle />
            {/* Language Picker */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="font-aptos text-sm leading-5 text-text-icons-base-main">
                  {user?.name ?? user?.email}
                </span>
                <Button
                  type="button"
                  variant={"outline"}
                  className="text-primary-pink hover:cursor-pointer hover:text-primary-pink"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant={"outline"}
                className="text-primary-pink hover:cursor-pointer hover:text-primary-pink"
                onClick={() => {
                  setIsLoginModalOpen(true);
                }}
              >
                {t("title")}
              </Button>
            )}
            {/* <div className="flex items-center space-x-2.5 bg-[#FFF6FE] p-2.5">
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
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
