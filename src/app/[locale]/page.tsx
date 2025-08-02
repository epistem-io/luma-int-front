import { FloatingPanel } from "./components/FloatingPanel";
import { LegendPanel } from "./components/LegendPanel";
import Map1 from "./components/Map";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-66px)]">
      <FloatingPanel />
      <Map1 />
      <LegendPanel />
    </div>
  );
}
