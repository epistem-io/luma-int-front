import { BasemapButton } from "./components/BasemapButton";
import { FloatingPanel } from "./components/FloatingPanel";
import { LegendPanel } from "./components/LegendPanel";
import { LegendPanelNew } from "./components/LegendPanelNew";
import Map1 from "./components/Map";
import { NewFloatingPanel } from "./components/NewFloatingPanel";
import { ProgressPanel } from "./components/ProgressPanel";
import { ZoomButton } from "./components/ZoomButton";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-66px)] relative bg-neutral-100">
      {/* <FloatingPanel /> */}
      {/* <div className="max-h-[calc(100vh-114px)] absolute z-20 top-4 left-8 h-full"> */}
      <div className="absolute z-20 top-4 left-8 h-fit">
        <NewFloatingPanel />
      </div>
      <Map1 />
      <div className="flex flex-col gap-y-4 absolute right-10 top-8 ">
        <ZoomButton />
        <BasemapButton />
      </div>
      {/* <LegendPanel /> */}
      <LegendPanelNew />
    </div>
  );
}
