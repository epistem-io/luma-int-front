"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{ className: "font-aptos" }}
            style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "rgba(212, 241, 227, 1)",
          "--success-border": "rgba(212, 241, 227, 1)",
          "--success-text": "rgba(23, 111, 69, 1)",
          "--width": "400px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
