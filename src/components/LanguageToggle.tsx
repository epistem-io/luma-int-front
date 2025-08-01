"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

const LanguageToggle = () => {
  const pathname = usePathname();
  const router = useRouter();

  const params = useParams();

  const locale = useLocale();

  return (
    <div className="flex items-center space-x-2.5 bg-[#FFF6FE] p-2.5">
      <button
        onClick={() =>
          router.replace(
            // @ts-expect-error -- TypeScript will validate that only known `params`
            // are used in combination with a given `pathname`. Since the two will
            // always match for the current route, we can skip runtime checks.
            { pathname, params },
            { locale: "en" },
          )
        }
        className={cn(
          "p-0 text-md font-inter font-medium transition-colors hover:cursor-pointer",
          locale === "en"
            ? "text-[#CC4778] font-bold"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </button>
      <div className="h-4 w-px bg-border" />
      <button
        onClick={() =>
          router.replace(
            // @ts-expect-error -- TypeScript will validate that only known `params`
            // are used in combination with a given `pathname`. Since the two will
            // always match for the current route, we can skip runtime checks.
            { pathname, params },
            { locale: "id" },
          )
        }
        className={cn(
          "p-0 text-md font-inter font-medium transition-colors hover:cursor-pointer",
          locale === "id"
            ? "text-[#CC4778] font-bold"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        ID
      </button>
    </div>
  );
};

export default LanguageToggle;
