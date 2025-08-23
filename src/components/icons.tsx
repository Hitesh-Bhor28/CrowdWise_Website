import type { SVGProps } from "react";

export function CrowdWiseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      <path d="M12 11c-2.2 0-4 1.8-4 4v1h8v-1c0-2.2-1.8-4-4-4z" />
    </svg>
  );
}
