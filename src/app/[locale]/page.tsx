import { FloatingPanel } from "./components/FloatingPanel";
import { LegendPanel } from "./components/LegendPanel";
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
      {/* <LegendPanel /> */}
      {/* <ZoomButton /> */}
    </div>
  );
}
