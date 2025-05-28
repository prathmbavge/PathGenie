import { cn } from "../lib/utils";

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-2 md:auto-rows-[17rem] md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}) => {
  return (
    <div
      className={cn(
        "rounded-none relative group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 border p-10 transition duration-200 hover:shadow-xl   dark:shadow-none h-[230px] bg-transparent backdrop-blur",
        className
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        <div className="text-3xl text-red-500 dark:text-white mb-2">{icon}</div>

        <div className="mt-2 mb-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};
