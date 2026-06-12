import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#C9A84C] text-[#0B0B0B] hover:bg-[#E6C97A] hover:shadow-[0_0_24px_0_#C9A84C35]",
        outline:
          "border border-[#2A2A2A] text-[#A8A49E] hover:border-[#C9A84C40] hover:text-[#F0EDE8]",
        ghost:
          "text-[#A8A49E] hover:text-[#F0EDE8] hover:bg-[#1A1A1A]",
        link:
          "text-[#C9A84C] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm:      "h-8 px-4 text-xs",
        lg:      "h-12 px-8 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
