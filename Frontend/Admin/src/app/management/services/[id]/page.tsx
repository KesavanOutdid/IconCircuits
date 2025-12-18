"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api-client";

interface LeadTime {
  lead_id: number;
  name: string;
  days: number;
  price_multiplier: number;
  status: boolean;
}

interface ConfigOption {
  type: string;
  options?: (string | number)[];
  multiplier?: Record<string, number>;
  unit?: string;
  min?: { x: number; y: number };
  max?: { x: number; y: number };
  area_pricing?: {
    min_area_sqmm: number;
    max_area_sqmm: number;
    slabs: Array<{ min: number; max: number; multiplier: number }>;
  };
}

interface ServiceDetail {
  _id: string;
  service_id: number;
  name: string;
  code: string;
  description: string;
  category: string;
  type: string;
  status: boolean;
  base_price?: number;
  min_order_qty?: number;
  lead_times?: LeadTime[];
  config: {
    layers?: ConfigOption;
    components?: ConfigOption;
    pcb_type?: ConfigOption;
    dimension?: ConfigOption;
    component_placement?: ConfigOption;
    controlled_impedance?: ConfigOption;
    lead_time_days?: ConfigOption;
    delivery_format?: ConfigOption;
  };
  createdBy: number;
  createdTime: string;
  modifiedBy: number;
  modifiedTime: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewService() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id as string;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetail();
    }
  }, [serviceId]);

  const fetchServiceDetail = async () => {
    if (!serviceId) {
      setError("Invalid service ID");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall<ServiceDetail>(
        `/api/admin/services/${serviceId}`
      );
      setService(data);
    } catch (err) {
      console.error("Failed to fetch service details:", err);
      setError("Failed to load service details. Invalid service ID.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark dark:text-white">Loading...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error || "Service not found"}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-body-1xlg font-bold text-dark dark:text-white">
          SERVICE DETAILS
        </h1>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-lg bg-gray-300 px-5 py-2 text-sm font-medium text-dark hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            Basic Information
          </h2>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Service Name
              </label>
              <p className="mt-2 text-dark dark:text-white">{service.name}</p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Code
              </label>
              <p className="mt-2 text-dark dark:text-white">{service.code}</p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Description
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {service.description}
              </p>
            </div>
           
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Base Price (₹)
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {service.base_price ? `₹${service.base_price.toLocaleString("en-IN")}` : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Status
              </label>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3.5 py-1 text-sm font-normal ${
                    service.status
                      ? "bg-[#219653]/[0.08] text-[#219653]"
                      : "bg-[#DC3545]/[0.08] text-[#DC3545]"
                  }`}
                >
                  {service.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

      

        {service.config && Object.keys(service.config).length > 0 && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Service Configuration
            </h2>
            <div className="space-y-6">
              {Object.entries(service.config).map(([fieldName, fieldConfig]: [string, any]) => {
                if (!fieldConfig) return null;
                
                const fieldLabel = fieldName
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase());

                if (fieldName === "dimension") {
                  return (
                    <div key={fieldName} className="border-b border-[#eee] pb-6 last:border-b-0 dark:border-dark-3">
                      <h3 className="mb-3 text-base font-semibold text-dark dark:text-white">{fieldLabel}</h3>
                      <div className="space-y-4">
                        {fieldConfig.unit && (
                          <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Unit</p>
                            <p className="mt-1 text-dark dark:text-white">{fieldConfig.unit}</p>
                          </div>
                        )}
                        {fieldConfig.min && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Min X</p>
                              <p className="mt-1 text-dark dark:text-white">{fieldConfig.min.x}</p>
                            </div>
                            <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Min Y</p>
                              <p className="mt-1 text-dark dark:text-white">{fieldConfig.min.y}</p>
                            </div>
                          </div>
                        )}
                        {fieldConfig.max && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Max X</p>
                              <p className="mt-1 text-dark dark:text-white">{fieldConfig.max.x}</p>
                            </div>
                            <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Max Y</p>
                              <p className="mt-1 text-dark dark:text-white">{fieldConfig.max.y}</p>
                            </div>
                          </div>
                        )}
                        {fieldConfig.area_pricing && (
                          <div className="space-y-3">
                            {fieldConfig.area_pricing.slabs && fieldConfig.area_pricing.slabs.length > 0 && (
                              <div>
                                <p className="mb-2 text-sm font-semibold text-dark dark:text-white">Pricing Slabs:</p>
                                <div className="space-y-2">
                                  {fieldConfig.area_pricing.slabs.map((slab: any, idx: number) => (
                                    <div key={idx} className="rounded bg-gray-100 p-3 dark:bg-gray-700">
                                      <p className="text-sm text-dark dark:text-white">
                                        {slab.min} - {slab.max} sq mm: <span className="font-semibold">{slab.multiplier}x</span>
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (fieldConfig.options && Array.isArray(fieldConfig.options) && fieldConfig.options.length > 0) {
                  return (
                    <div key={fieldName} className="border-b border-[#eee] pb-6 last:border-b-0 dark:border-dark-3">
                      <h3 className="mb-3 text-base font-semibold text-dark dark:text-white">{fieldLabel}</h3>
                      <div className="space-y-2">
                        {fieldConfig.options.map((option: string | number, index: number) => (
                          <div key={`${fieldName}-${option}-${index}`} className="flex items-center justify-between rounded bg-gray-100 p-2 dark:bg-gray-700">
                            <span className="text-dark dark:text-white">{option}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Multiplier: {fieldConfig.multiplier?.[String(option)] || 1.0}x
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}

        {service.lead_times && service.lead_times.length > 0 && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Lead Times
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eee] dark:border-dark-3">
                    <th className="px-4 py-3 text-left text-base font-semibold text-dark dark:text-white">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-base font-semibold text-dark dark:text-white">
                      Days
                    </th>
                    <th className="px-4 py-3 text-left text-base font-semibold text-dark dark:text-white">
                      Price Multiplier
                    </th>
                    <th className="px-4 py-3 text-left text-base font-semibold text-dark dark:text-white">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {service.lead_times.map((lead) => (
                    <tr
                      key={lead.lead_id}
                      className="border-b border-[#eee] dark:border-dark-3"
                    >
                      <td className="px-4 py-3 text-sm text-dark dark:text-white">
                        {lead.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-dark dark:text-white">
                        {lead.days} days
                      </td>
                      <td className="px-4 py-3 text-sm text-dark dark:text-white">
                        {lead.price_multiplier}x
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-normal ${
                            lead.status
                              ? "bg-[#219653]/[0.08] text-[#219653]"
                              : "bg-[#DC3545]/[0.08] text-[#DC3545]"
                          }`}
                        >
                          {lead.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-extrabold text-dark dark:text-white">
            Metadata
          </h2>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Created By
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {service.createdBy}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Created At
              </label>
              <p className="mt-2 text-sm text-dark dark:text-white">
                {new Date(service.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Modified By
              </label>
              <p className="mt-2 text-dark dark:text-white">
               {service.modifiedBy}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Modified At
              </label>
              <p className="mt-2 text-sm text-dark dark:text-white">
                {new Date(service.modifiedTime).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
