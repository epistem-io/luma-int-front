import { FloatingPanel } from "@/app/components/FloatingPanel";
import Map1 from "./components/Map";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-66px)] p-8 pb-20 gap-16 sm:p-20">
      <FloatingPanel />
      <Map1 />
    </div>
  );
}
