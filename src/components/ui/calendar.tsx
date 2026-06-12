"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        months:   "flex flex-col",
        month:    "w-full",

        caption:       "flex justify-between items-center mb-5 px-1",
        caption_label: "font-display text-base font-semibold text-[#F0EDE8] tracking-wide",

        nav:                "flex items-center gap-1",
        nav_button:         cn(
          "inline-flex items-center justify-center w-7 h-7",
          "border border-[#2A2A2A] text-[#6B6760]",
          "hover:border-[#C9A84C40] hover:text-[#C9A84C] hover:bg-[#C9A84C08]",
          "transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        ),
        nav_button_previous: "",
        nav_button_next:     "",

        table:     "w-full border-collapse",
        head_row:  "flex mb-1",
        head_cell: "flex-1 text-center text-[11px] font-medium tracking-wider uppercase text-[#6B6760] py-2",

        row:  "flex w-full mt-1 gap-0.5",
        cell: "flex-1 text-center",

        day: cn(
          "w-full aspect-square flex items-center justify-center",
          "text-sm text-[#A8A49E] font-medium",
          "rounded-none transition-all duration-150",
          "hover:bg-[#C9A84C15] hover:text-[#F0EDE8]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A84C]"
        ),
        day_selected: "!bg-[#C9A84C] !text-[#0B0B0B] font-semibold hover:!bg-[#E6C97A]",
        day_today:    "border border-[#C9A84C40] text-[#C9A84C]",
        day_outside:  "opacity-20 cursor-default pointer-events-none",
        day_disabled: "opacity-20 cursor-not-allowed line-through",
        day_hidden:   "invisible",

        ...classNames,
      }}
      components={{
        IconLeft:  () => <ChevronLeft  className="w-4 h-4" />,
        IconRight: () => <ChevronRight className="w-4 h-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
