import { CircleAlert } from "lucide-react";

export const ComingSoon = () => {
  return (
    <div className="rounded-sm py-1 px-2 flex flex-row items-center bg-text-icons-disabled gap-x-2">
      <CircleAlert size={17} className="text-text-icons-base-second" />
      <p className="font-aptos text-sm font-bold leading-5 text-text-icons-base-second">
        This feature is coming soon
      </p>
    </div>
  );
};
