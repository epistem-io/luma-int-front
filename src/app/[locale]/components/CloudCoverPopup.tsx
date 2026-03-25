import { HelpCircle } from "lucide-react";
import Image from "next/image";

export const CloudCoverPopup = () => {
  return (
    <div className="space-y-3 p-4">
      <div className="space-y-1">
        <div className="flex flex-row items-center gap-x-2">
          <HelpCircle className="size-6 text-primary-pink" />
          <p className="text-m-bold text-text-icons-base-main">
            Tutupan awan di Composite
          </p>
        </div>
        <p className="text-xs-regular text-text-icons-base-third">
          Tutupan awan adalah bla bla bla dan ditampilkan dalam persentase lorem
          ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem
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
            True Color Composite (RGB)
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
            False Color Infrared Composite (NIR/Red/Green)
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
            Land/Water Composite (NIR/SWIR1/Red)
          </p>
        </div>
      </div>
    </div>
  );
};
