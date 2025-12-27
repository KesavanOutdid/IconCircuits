"use client";

import { apiCall } from "@/lib/api-client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function EditServiceRouter() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      fetchAndRoute();
    }
  }, [serviceId]);

  const determineServiceType = (data: any): string => {
    if (data.service_type) return data.service_type;
    if (data.type && data.type !== "") return data.type;
    
    const config = data.config || {};
    const configKeys = Object.keys(config);
    
    if (configKeys.includes("outer_copper_weight") || configKeys.includes("pcb_color_silkscreen_map") || configKeys.includes("via_covering")) {
      return "pcb_fabrication";
    }
    
    if (configKeys.includes("dimension") || configKeys.includes("controlled_impedance") || configKeys.includes("delivery_format")) {
      return "pcb_layout";
    }
    
    if (configKeys.includes("assembly_type") || configKeys.includes("rework_allowed") || configKeys.includes("testing_type")) {
      return "pcb_assembly";
    }
    
    if (configKeys.includes("supplier_type") || configKeys.includes("warranty_period") || configKeys.includes("quality_assurance")) {
      return "component_sourcing";
    }
    
    return "pcb_layout";
  };

  const fetchAndRoute = async () => {
    try {
      const data = await apiCall<any>(`/api/admin/services/${serviceId}`);
      const serviceType = determineServiceType(data);
      const path = serviceType.replace(/_/g, "-");
      
      router.push(`/management/services/${serviceId}/edit/${path}`);
    } catch (error) {
      console.error("Failed to fetch service:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load service data",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-dark dark:text-white">Loading...</p>
    </div>
  );
}
