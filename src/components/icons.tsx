import type { SVGProps } from "react";
import { Loader2 } from "lucide-react";

export const Icons = {
  spinner: Loader2,
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M15.5 10.5c-1.5 0-2.5 1-2.5 2.5s1 2.5 2.5 2.5c1.5 0 2.5-1 2.5-2.5s-1-2.5-2.5-2.5z" />
      <path d="M8.5 10.5c-1.5 0-2.5 1-2.5 2.5s1 2.5 2.5 2.5c1.5 0 2.5-1 2.5-2.5s-1-2.5-2.5-2.5z" />
      <path d="M12 8c-1.5 0-2.5-1-2.5-2.5S10.5 3 12 3s2.5 1 2.5 2.5-1 2.5-2.5 2.5z" />
    </svg>
  ),
};
