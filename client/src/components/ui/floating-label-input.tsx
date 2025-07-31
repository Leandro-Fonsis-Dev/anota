import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, type, id, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          id={id}
          className={cn(
            "peer w-full px-3 pt-6 pb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white",
            className
          )}
          placeholder=" "
          ref={ref}
          {...props}
        />
        <label
          htmlFor={id}
          className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary-500"
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
