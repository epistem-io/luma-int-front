"use client";

import { useContext } from "react";
import Image from "next/image";
// import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/contexts/authContext";
import { GlobalContext } from "@/contexts/globalContext";
import { toast } from "sonner"
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";
import LanguageToggle from "./LanguageToggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

const getUserInitials = (name?: string, email?: string) => {
  const nameParts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (nameParts.length > 0) {
    return nameParts
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  return (email?.replace(/\s+/g, "").slice(0, 2) ?? "").toUpperCase();
};

export function NavBar({ className }: NavBarProps) {
  const t = useTranslations("LoginModal");
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { setIsLoginModalOpen } = useContext(GlobalContext);
  const tSave = useTranslations("SaveProgress");
  const { saveProgress } = useContext(SessionCheckpointContext);
  const userInitials = getUserInitials(user?.name, user?.email);

  return (
    <nav
      className={cn("z-50 w-full bg-white", className)}
      // className={cn("sticky top-0 z-50 w-full bg-neutral-100", className)}
    >
      <div className="w-full py-2 px-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          {/* External landing page: plain <a> (next-intl's Link would
              locale-prefix it), NEXT_PUBLIC_ so the client bundle sees it. */}
          <a
            href={
              process.env.NEXT_PUBLIC_LANDING_PAGE_URL ??
              "https://epistem.io/id/luma"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
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
          </a>

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open user menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF6FE] font-aptos text-sm font-semibold leading-5 text-primary-pink outline-none transition-colors hover:cursor-pointer hover:bg-[#FFEAFB] focus-visible:ring-2 focus-visible:ring-primary-pink focus-visible:ring-offset-2"
                  >
                    {userInitials || "U"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem]">
                  <DropdownMenuItem
                    className="font-aptos text-sm leading-5 text-primary-pink hover:cursor-pointer"
                    onClick={logout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  type="button"
                  variant={"ghost"}
                  className="text-neutral-700 hover:cursor-pointer"
                  onClick={() => {
                    setIsLoginModalOpen(true);
                  }}
                >
                  {t("title")}
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-primary-pink text-white hover:cursor-pointer hover:bg-primary-pink/90 rounded-[16px]"
                  onClick={() => {
                    if (saveProgress()) {
                      toast.success(tSave("savedToast"));
                    } else {
                      toast.info(tSave("nothingToSaveToast"));
                    }
                    setIsLoginModalOpen(true);
                  }}
                >
                  <Save className="h-4 w-4" />
                  {tSave("button")}
                </Button>
              </>
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
