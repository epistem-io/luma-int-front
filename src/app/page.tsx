import { FloatingPanel } from "@/components/FloatingPanel";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-66px)] p-8 pb-20 gap-16 sm:p-20">
      <FloatingPanel />
    </div>
  );
}
