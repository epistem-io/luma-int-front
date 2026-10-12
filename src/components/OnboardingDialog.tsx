"use client";

import {
  CalendarDays,
  ChartColumn,
  Grid2x2Plus,
  Layers,
  List,
  type LucideIcon,
  MapPin,
  Pentagon,
  Satellite,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { type ReactNode, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SessionCheckpointContext } from "@/contexts/sessionCheckpointContext";
import { onboardingStore } from "@/lib/onBoardingStore";
import { sessionStore } from "@/lib/sessionStore";
import { cn } from "@/lib/utils";

interface OnboardingItem {
  key: string;
  icon: LucideIcon;
}

interface OnboardingStep {
  key: string;
  illustration: string;
  layout: keyof typeof ITEM_LAYOUT;
  items: OnboardingItem[];
}

const ITEM_LAYOUT = {
  list: {
    list: "mt-5 divide-y divide-neutral-400",
    item: "flex items-start gap-4 py-5",
  },
  columns: {
    list: "mt-12 mb-8 grid gap-4 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-neutral-400",
    item: "flex items-start gap-3 sm:px-4 sm:first:pl-0",
  },
};

const ILLUSTRATION_DIR = "/images/onboarding";
const INTRO_ILLUSTRATION = `${ILLUSTRATION_DIR}/luma_onboarding_step0_welcome.png`;

const STEPS: OnboardingStep[] = [
  {
    key: "basicInformation",
    illustration: `${ILLUSTRATION_DIR}/luma_onboarding_step1_basic_information.webp`,
    layout: "list",
    items: [
      { key: "geographicArea", icon: Pentagon },
      { key: "timePeriod", icon: CalendarDays },
      { key: "satelliteImagery", icon: Satellite },
    ],
  },
  {
    key: "landCoverClassification",
    illustration: `${ILLUSTRATION_DIR}/luma_onboarding_step2_lulc_classification.webp`,
    layout: "columns",
    items: [
      { key: "ownClassification", icon: Grid2x2Plus },
      { key: "defaultClassification", icon: List },
    ],
  },
  {
    key: "mappingSampleData",
    illustration: `${ILLUSTRATION_DIR}/luma_onboarding_step3_mapping_sample_data.webp`,
    layout: "columns",
    items: [
      { key: "uploadSampleData", icon: Upload },
      { key: "onScreenSampling", icon: MapPin },
    ],
  },
  {
    key: "mappingParameters",
    illustration: `${ILLUSTRATION_DIR}/luma_onboarding_step4_mapping_parameters.webp`,
    layout: "list",
    items: [
      { key: "selectPredictors", icon: Layers },
      { key: "modelSettings", icon: SlidersHorizontal },
    ],
  },
  {
    key: "yourMap",
    illustration: `${ILLUSTRATION_DIR}/luma_onboarding_step5_your_map.webp`,
    layout: "list",
    items: [
      { key: "checkResult", icon: ChartColumn },
      { key: "validateMap", icon: ShieldCheck },
    ],
  },
];

const ILLUSTRATIONS = [INTRO_ILLUSTRATION, ...STEPS.map((s) => s.illustration)];

const DIALOG_SIZE =
  "h-[min(616px,calc(100dvh-2rem))] w-full max-w-[min(1024px,calc(100%-2rem))]";

const FOOTER_BUTTON = "h-10 min-w-[132px] rounded-xl px-4 font-pjs text-[15px]";

type Translate = (key: string, values?: Record<string, unknown>) => string;

const OnboardingIllustration = ({ activeSrc }: { activeSrc: string }) => (
  <div className="relative hidden w-[42%] shrink-0 overflow-hidden rounded-2xl bg-primary-red-pink-light-hover md:block">
    {ILLUSTRATIONS.map((src) => (
      <Image
        key={src}
        src={src}
        alt=""
        fill
        sizes="420px"
        className={cn(
          "object-cover transition-opacity duration-300",
          src !== activeSrc && "opacity-0",
        )}
      />
    ))}
  </div>
);

const OnboardingFooter = ({
  footnote,
  children,
}: {
  footnote: string;
  children: ReactNode;
}) => (
  <div className="mt-5 flex shrink-0 items-center justify-between gap-4">
    <p className="text-sm leading-5 text-neutrals-500">{footnote}</p>
    <div className="flex shrink-0 gap-3">{children}</div>
  </div>
);

export const OnboardingDialog = () => {
  const { pendingResume, isRestoring } = useContext(SessionCheckpointContext);
  const t = useTranslations("Onboarding") as unknown as Translate;
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState<number | null>(null);

  useEffect(() => {
    if (onboardingStore.hasCompleted()) return;
    void sessionStore.load().then((checkpoint) => {
      if (checkpoint === null) setIsOpen(true);
    });
  }, []);

  const finish = () => {
    onboardingStore.markCompleted();
    setIsOpen(false);
  };

  const step = stepIndex === null ? null : STEPS[stepIndex];
  const current = stepIndex ?? -1;
  const isLast = current === STEPS.length - 1;
  const goBack = () =>
    setStepIndex((index) => (index === null || index === 0 ? null : index - 1));
  const goNext = () => setStepIndex((index) => (index === null ? 0 : index + 1));

  return (
    <Dialog
      open={isOpen && pendingResume === null && !isRestoring}
      onOpenChange={(open) => {
        if (!open) finish();
      }}
    >
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        className={cn(
          DIALOG_SIZE,
          "flex gap-0 overflow-hidden rounded-2xl border-none p-3.5 font-pjs",
        )}
      >
        <OnboardingIllustration
          activeSrc={step?.illustration ?? INTRO_ILLUSTRATION}
        />

        {step === null ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-4 md:pl-10 md:pr-5">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="my-auto animate-in fade-in-0 duration-300">
                <DialogTitle className="text-[48px] font-bold leading-[1.3] tracking-[-0.48px] text-primary-pink">
                  {t("intro.title")}
                </DialogTitle>
                <DialogDescription className="mt-4 text-xl leading-7 text-neutral-700-baru">
                  {t("intro.description")}
                </DialogDescription>
              </div>
            </div>

            <OnboardingFooter footnote={t("intro.footnote")}>
              <Button
                type="button"
                variant="secondary"
                onClick={finish}
                className={FOOTER_BUTTON}
              >
                {t("skipTour")}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={goNext}
                className={FOOTER_BUTTON}
              >
                {t("letsStart")}
              </Button>
            </OnboardingFooter>
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-4 md:pl-8 md:pr-5">
            <button
              type="button"
              onClick={finish}
              className={cn(
                "shrink-0 self-end text-[15px] leading-6 text-primary-pink hover:cursor-pointer hover:underline",
                isLast && "invisible",
              )}
            >
              {t("skipAll")}
            </button>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <div className="my-auto">
                <div
                  key={step.key}
                  className="animate-in fade-in-0 slide-in-from-right-4 duration-300"
                >
                  <DialogTitle className="text-[32px] font-bold leading-[1.2] tracking-[-0.32px] text-primary-pink lg:text-[40px] lg:tracking-[-0.4px]">
                    {t(`${step.key}.title`)}
                  </DialogTitle>
                  <p className="mt-1 text-xl leading-7 text-primary-pink">
                    {t(`${step.key}.subtitle`)}
                  </p>
                  <DialogDescription className="mt-2 text-base leading-6 text-neutral-700-baru">
                    {t(`${step.key}.description`)}
                  </DialogDescription>

                  <ul className={ITEM_LAYOUT[step.layout].list}>
                    {step.items.map(({ key, icon: Icon }) => (
                      <li key={key} className={ITEM_LAYOUT[step.layout].item}>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-red-pink-light text-primary-pink">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-base font-semibold leading-6 text-text-icons-base-main">
                            {t(`${step.key}.items.${key}.title`)}
                          </p>
                          <p className="text-xs leading-4 text-text-icons-base-second">
                            {t(`${step.key}.items.${key}.caption`)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-center gap-2.5">
                  {STEPS.map((s, index) => (
                    <button
                      key={s.key}
                      type="button"
                      aria-label={t("goToStep", { step: index + 1 })}
                      aria-current={index === current ? "step" : undefined}
                      onClick={() => setStepIndex(index)}
                      className={cn(
                        "size-2 rounded-full transition-colors hover:cursor-pointer",
                        index < current && "bg-primary-pink/40",
                        index === current && "bg-primary-pink",
                        index > current && "bg-neutrals-400",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <OnboardingFooter footnote={t(`${step.key}.footnote`)}>
              <Button
                type="button"
                variant="secondary"
                onClick={goBack}
                className={FOOTER_BUTTON}
              >
                {t("prev")}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={isLast ? finish : goNext}
                className={FOOTER_BUTTON}
              >
                {isLast ? t("finish") : t("next")}
              </Button>
            </OnboardingFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};