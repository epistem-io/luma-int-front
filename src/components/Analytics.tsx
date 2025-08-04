"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export const Analytis = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      Clarity.init(process.env.NEXT_PUBLIC_CL_ID!);
    }
  }, []);

  return (
    <>{process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId="G-XYZ" />}</>
  );
};
