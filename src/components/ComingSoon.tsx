import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

export const ComingSoon = () => {
  const t = useTranslations("InteractivePanel");
  return (
    <div className="rounded-sm py-1 px-2 flex flex-row items-center bg-text-icons-disabled gap-x-2">
      <CircleAlert size={17} className="text-text-icons-base-second" />
      <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-second">
        {t("common.featureComingSoon")}
      </p>
    </div>
  );
};
