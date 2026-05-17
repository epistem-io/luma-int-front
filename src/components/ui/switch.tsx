"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

type NonButtonSwitchProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "onClick"
> & {
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function NonButtonSwitch({
  className,
  checked,
  disabled = false,
  onCheckedChange,
  ...props
}: NonButtonSwitchProps) {
  const toggle = React.useCallback(() => {
    if (disabled) {
      return
    }

    onCheckedChange?.(!checked)
  }, [checked, disabled, onCheckedChange])

  return (
    <div
      data-slot="switch"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "peer focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px]",
        checked ? "bg-primary" : "bg-input dark:bg-input/80",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={(event) => {
        event.stopPropagation()
        toggle()
      }}
      onPointerDown={(event) => {
        event.stopPropagation()
      }}
      onKeyDown={(event) => {
        event.stopPropagation()

        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          toggle()
        }
      }}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform dark:bg-foreground",
          checked ? "translate-x-[calc(100%-2px)]" : "translate-x-0"
        )}
      />
    </div>
  )
}

export { NonButtonSwitch, Switch }
