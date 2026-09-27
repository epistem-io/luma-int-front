"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      // richColors gives success/info their own green/blue; errors go through
      // showErrorToast (components/ui/error-toast.tsx), a custom toast.
      richColors
      closeButton
      toastOptions={{ className: "font-aptos" }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--width": "400px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
