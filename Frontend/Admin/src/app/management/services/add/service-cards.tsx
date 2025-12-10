"use client";

import { useRouter } from "next/navigation";

type ServiceType =
  | "pcb_layout"
  | "pcb_fabrication"
  | "pcb_assembly"
  | "component_sourcing";

const SERVICE_TYPES = {
  pcb_layout: { label: "PCB Layout", path: "pcb-layout" },
  pcb_fabrication: { label: "PCB Fabrication", path: "pcb-fabrication" },
  pcb_assembly: { label: "PCB Assembly", path: "pcb-assembly" },
  component_sourcing: { label: "Component Sourcing", path: "component-sourcing" },
} as const;

interface ServiceCardsProps {
  currentService: ServiceType;
}

export default function ServiceCards({ currentService }: ServiceCardsProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex gap-4">
      {(Object.keys(SERVICE_TYPES) as ServiceType[]).map((serviceType) => {
        const isActive = serviceType === currentService;
        const info = SERVICE_TYPES[serviceType];

        return (
          <button
            key={serviceType}
            onClick={() => router.push(`/management/services/add/${info.path}`)}
           className={`group flex flex-1 items-center justify-center gap-3 rounded-lg px-4 py-4 transition duration-200
  border border-primary
  ${
    isActive
      ? "bg-primary text-white shadow-md"
      : "bg-white text-dark"
  }`}

          >
            {/* ICON */}
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
              {serviceType === "pcb_layout" && (
                <>
                  <rect x="4" y="4" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="8" y="8" width="8" height="8" fill="currentColor" />
                  <rect x="20" y="8" width="8" height="8" fill="currentColor" />
                  <rect x="8" y="20" width="8" height="8" fill="currentColor" />
                  <rect x="20" y="20" width="8" height="8" fill="currentColor" />
                </>
              )}

              {serviceType === "pcb_fabrication" && (
                <path
                  d="M8 12V28C8 30.21 9.79 32 12 32H28C30.21 32 32 30.21 32 28V12M8 12H32M8 12L6 8H34L32 12M14 16V28M20 16V28M26 16V28"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              )}

              {serviceType === "pcb_assembly" && (
                <>
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <circle cx="28" cy="12" r="3" fill="currentColor" />
                  <circle cx="12" cy="28" r="3" fill="currentColor" />
                  <circle cx="28" cy="28" r="3" fill="currentColor" />
                  <line x1="12" y1="15" x2="12" y2="25" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="28" y1="15" x2="28" y2="25" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="15" y1="12" x2="25" y2="12" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="15" y1="28" x2="25" y2="28" stroke="currentColor" strokeWidth="1.5" />
                </>
              )}

              {serviceType === "component_sourcing" && (
                <path
                  d="M8 14L20 6L32 14V32C32 33.1 31.1 34 30 34H10C8.9 34 8 33.1 8 32V14Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              )}
            </svg>

            {/* TEXT */}
            <span className={`text-base font-semibold ${isActive ? "text-white" : ""}`}>
              {info.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
