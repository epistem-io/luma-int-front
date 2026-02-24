import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

export const YourMapComponent = () => {
  return (
    <>
      <div className="space-y-4">
        <LULCCompositionSummary />
        <TrainingDataQuality />
        <PredictorImportances />
        <ModelAccuracyAssessment />
        <ThematicAccuracyAssessment />
      </div>
    </>
  );
};

export const YourMapFooter = () => {
  return (
    <>
      <div className="grid grid-cols-2 p-3 pt-4 gap-x-4">
        <div></div>
        <Button
          onClick={() => {
            // setStepKey(PANEL_COMPONENT_KEY.DEFINE_LUC);
            // setProgressPanelIndex(2);
            // onClickNext();
          }}
          disabled={true}
          variant="primary"
          className=""
        >
          Next
        </Button>
      </div>
    </>
  );
};

const Card = ({ children }: { children: ReactNode }) => {
  return (
    <div className="p-3 rounded-[12px] border border-neutral-400 bg-white">
      {children}
    </div>
  );
};

const COMPOSITION_ARR = [
  {
    color: "#EFC6D5",
    name: "Semak Belukar",
    percentage: 40,
    points: 10,
  },
  {
    color: "#E080A4",
    name: "Monokultur Sawit",
    percentage: 28,
    points: 7,
  },
  {
    color: "#300",
    name: "Monokultur Karet",
    percentage: 20,
    points: 5,
  },
  {
    color: "#CC4778",
    name: "Sawah",
    percentage: 8,
    points: 2,
  },
  {
    color: "#99355A",
    name: "Hutan",
    percentage: 4,
    points: 1,
  },
];

const LULCCompositionSummary = () => {
  const ARR_FIRST_HALF = COMPOSITION_ARR.slice(
    0,
    Math.ceil(COMPOSITION_ARR.length / 2),
  );
  const ARR_SECOND_HALF = COMPOSITION_ARR.slice(
    Math.ceil(COMPOSITION_ARR.length / 2),
  );
  return (
    <>
      <Card>
        <div className="space-y-5">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            LULC Composition Summary
          </p>
          <div className="flex flex-row w-full rounded-md overflow-hidden h-14">
            {COMPOSITION_ARR.map((item, index) => (
              <div
                key={`comop-${index}`}
                style={{
                  backgroundColor: item.color,
                  width: `${item.percentage}%`,
                }}
                className="h-full"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="space-y-3">
              {ARR_FIRST_HALF.map((item, index) => (
                <div
                  key={`compo-list-${item.name}-${index}`}
                  className="flex flex-row items-start"
                >
                  <div
                    className="size-5 aspect-square rounded-full mt-1 mr-2"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <div className="mr-1 flex-1">
                    <p className="text-black font-aptos text-lg font-semibold heading-7">
                      {item.name}
                    </p>
                    <p className="text-black font-aptos text-[15px]] font-regular heading-5.5">
                      {item.points} points
                    </p>
                  </div>

                  <p
                    className="font-noto-sans text-2xl font-bold heading-7.5 tracking-[-0.24px]"
                    style={{
                      color: item.color,
                    }}
                  >
                    {item.percentage}%
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {ARR_SECOND_HALF.map((item, index) => (
                <div
                  key={`compo-list-${item.name}-${index}`}
                  className="flex flex-row items-start"
                >
                  <div
                    className="size-5 aspect-square rounded-full mt-1 mr-2"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <div className="mr-1 flex-1">
                    <p className="text-black font-aptos text-lg font-semibold heading-7">
                      {item.name}
                    </p>
                    <p className="text-black font-aptos text-[15px]] font-regular heading-5.5">
                      {item.points} points
                    </p>
                  </div>

                  <p
                    className="font-noto-sans text-2xl font-bold heading-7.5 tracking-[-0.24px]"
                    style={{
                      color: item.color,
                    }}
                  >
                    {item.percentage}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

const TrainingDataQuality = () => {
  return (
    <>
      <Card>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              Training Data Quality
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
              This analysis checks how distinct your land cover classes are
              based on their spectral characteristics.
            </p>
          </div>

          <div className="p-2 rounded-[12px] bg-danger-50 space-y-2 ">
            <div className="flex flex-row gap-x-2">
              <AlertCircleIcon className="size-6 text-danger-700" />
              <p className="font-aptos text-md font-bold leading-6 text-danger-700">
                Low class separability detected
              </p>
            </div>

            <div className="bg-white rounded-md px-2 py-1 font-aptos text-sm font-regular leading-5 text-danger-800">
              <p className="font-bold">
                Some class pairs have similar spectral characteristics, and
                below the threshold :
              </p>
              <div className="">
                <div className="flex flex-row gap-x-2 items-center">
                  <div className="size-1 rounded-full bg-danger-800" />
                  <p className="">Class [X] and Class [Y]</p>
                </div>
              </div>
              <p className="">
                This similarity may reduce classification accuracy.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

const PredictorImportances = () => {
  return (
    <>
      <Card>
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              Model Accuracy Assement
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
              This score shows how often the model predicts LULC correctly
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-x-3">
                <div className="bg-primary-red-pink-light text-primary-pink font-aptos text-md font-semibold leading-6 rounded-[12px] size-8 aspect-square flex flex-col items-center justify-center">
                  1
                </div>
                <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-main">
                  NDVI 25th Percentile
                </p>
              </div>
              <p className="font-lato text-md font-bold leading-6 text-text-icons-base-main">
                67-69 %
              </p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-x-3">
                <div className="bg-primary-red-pink-light text-primary-pink font-aptos text-md font-semibold leading-6 rounded-[12px] size-8 aspect-square flex flex-col items-center justify-center">
                  2
                </div>
                <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-main">
                  Green Median
                </p>
              </div>
              <p className="font-lato text-md font-bold leading-6 text-text-icons-base-main">
                55-60 %
              </p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-x-3">
                <div className="bg-primary-red-pink-light text-primary-pink font-aptos text-md font-semibold leading-6 rounded-[12px] size-8 aspect-square flex flex-col items-center justify-center">
                  3
                </div>
                <p className="font-aptos text-md font-semibold leading-6 text-text-icons-base-main">
                  Temperature
                </p>
              </div>
              <p className="font-lato text-md font-bold leading-6 text-text-icons-base-main">
                51-53 %
              </p>
            </div>
          </div>

          <div className="w-full flex flex-row justify-end">
            <Button
              variant={"ghost"}
              className="p-0 hover:bg-transparent cursor-pointer ml-auto"
              onClick={() => {
                // onResetInput();
              }}
            >
              <div className="">
                <p className="text-primary-pink font-roboto text-[15px] font-bold tracking-[-0.15px] underline">
                  Show Detail
                </p>
              </div>
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

const ModelAccuracyAssessment = () => {
  return (
    <>
      <Card>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
              Model Accuracy Assement
            </p>
            <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
              This score shows how often the model predicts LULC correctly
            </p>
          </div>

          <div className="p-2 rounded-[12px] bg-success-50 space-y-2 ">
            <div className="flex flex-row gap-x-2">
              {/* <AlertCircleIcon className="size-6 text-danger-700" /> */}
              <p className="font-aptos text-md font-bold leading-6 text-success-700">
                On average, the model predicts correctly 87% of the time
              </p>
            </div>

            <div className="bg-white rounded-md px-2 py-1 font-aptos text-sm font-regular leading-5 text-danger-800">
              {/* <div className="grid grid-cols-4"> */}
              <div className="flex flex-row justify-evenly">
                <div className="flex flex-col items-center">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second text-center">
                    Overall Accuracy
                  </p>
                  <p className="font-noto-sans text-2xl font-bold leading-7.5 text-text-icons-base-main">
                    83.3%
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second text-center">
                    Kappa Coefficient
                  </p>
                  <p className="font-noto-sans text-2xl font-bold leading-7.5 text-text-icons-base-main">
                    0.667
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second text-center">
                    Average F1-Score
                  </p>
                  <p className="font-noto-sans text-2xl font-bold leading-7.5 text-text-icons-base-main">
                    0.414
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-aptos text-sm font-semibold leading-5 text-text-icons-base-second text-center">
                    G-Mean Score
                  </p>
                  <p className="font-noto-sans text-2xl font-bold leading-7.5 text-text-icons-base-main">
                    0.841
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-row justify-end">
            <Button
              variant={"ghost"}
              className="p-0 hover:bg-transparent cursor-pointer ml-auto"
              onClick={() => {
                // onResetInput();
              }}
            >
              <div className="">
                <p className="text-primary-pink font-roboto text-[15px] font-bold tracking-[-0.15px] underline">
                  Show All Predictor
                </p>
              </div>
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

const ThematicAccuracyAssessment = () => {
  return (
    <>
      <Card>
        <div className="space-y-5">
          <p className="font-noto-sans text-xl font-bold leading-7 tracking-[-0.2px] text-text-icons-base-main">
            Thematic accuracy assessment
          </p>
          <p className="font-aptos text-md font-regular leading-6 text-neutral-700">
            The thematic accuracy assessment evaluates the correctness of the
            final LULC map using independent validation data
          </p>
          <div className="p-3 rounded-md bg-text-icons-base-main">
            <div className="space-y-1">
              <p className="font-aptos text-md font-bold leading-6 text-text-icons-on-color">
                Interested in deeper thematic accuracy analysis?
              </p>

              <p className="font-aptos text-sm font-regular leading-5 text-text-icons-on-color">
                Advanced thematic accuracy analysis and detailed reporting will
                be available through <b>Rona</b>, an upcoming Epistem analysis
                platform.
              </p>
            </div>
            <div className="w-full flex flex-row justify-center mt-[35px]">
              <Image
                alt="rona"
                width={1144}
                height={1064}
                src="/images/luma-displays.webp"
                className="w-[275px] "
              />
            </div>
            <div className="space-y-3">
              <p className="font-pjs text-sm font-medium text-text-icons-on-color">
                Rona
              </p>
              <p className="font-pjs text-xl font-bold text-text-icons-on-color">
                Shared data for shared benefits
              </p>
              <Button
                className="w-full rounded-md hover:bg-primary-pink hover:cursor-default"
                variant={"primary"}
              >
                <p className="font-aptos text-[13px]">Rona Coming Soon</p>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
