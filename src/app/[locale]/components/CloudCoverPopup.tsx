import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export const CloudCoverPopup = () => {
  const t = useTranslations("InteractivePanel");

  return (
    <div className="space-y-3 p-4">
      <div className="space-y-1">
        <div className="flex flex-row items-center gap-x-2">
          <HelpCircle className="size-6 text-primary-pink" />
          <p className="text-m-bold text-text-icons-base-main">
            {t("satelliteComposite.cloudCoverInComposite")}
          </p>
        </div>
        <p className="text-xs-regular text-text-icons-base-third">
          {t("satelliteComposite.cloudCoverInCompositeDescription")}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-x-4">
        <div className="space-y-2">
          <div>
            <Image
              src="/images/true-color-cc-popup.webp"
              alt="true-color"
              width={253}
              height={149}
              className="w-full"
            />
          </div>
          <p className="text-xs-regular text-neutral-700-baru">
            {t("satelliteComposite.cloudCoverTrueColor")}
          </p>
        </div>
        <div className="space-y-2">
          <div>
            <Image
              src="/images/false-color-infrared-cc-popup.webp"
              alt="true-color"
              width={253}
              height={149}
              className="w-full"
            />
          </div>
          <p className="text-xs-regular text-neutral-700-baru">
            {t("satelliteComposite.cloudCoverFalseColor")}
          </p>
        </div>
        <div className="space-y-2">
          <div>
            <Image
              src="/images/land-water-cc-popup.webp"
              alt="true-color"
              width={253}
              height={149}
              className="w-full"
            />
          </div>
          <p className="text-xs-regular text-neutral-700-baru">
            {t("satelliteComposite.cloudCoverLandWater")}
          </p>
        </div>
      </div>
    </div>
  );
};
