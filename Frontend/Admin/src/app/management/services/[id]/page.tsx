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

interface FlexConfig {
  material?: ConfigOption;
  surface_finish?: ConfigOption;
  fpc_thickness?: ConfigOption;
}

interface CustomConfig {
  custom_thickness_options?: ConfigOption;
}

interface PcbTypeConfig extends ConfigOption {
  flex_config?: FlexConfig;
}

interface ThicknessTypeConfig extends ConfigOption {
  custom_config?: CustomConfig;
}

interface ColorSilkscreenMapping {
  type: string;
  mapping?: Record<string, string[]>;
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
    pcb_type?: PcbTypeConfig;
    dimension?: ConfigOption;
    component_placement?: ConfigOption;
    controlled_impedance?: ConfigOption;
    lead_time_days?: ConfigOption;
    delivery_format?: ConfigOption;
    base_material?: ConfigOption;
    pcb_quality?: ConfigOption;
    product_type?: ConfigOption;
    different_design?: ConfigOption;
    pcb_thickness?: ConfigOption;
    outer_copper_weight?: ConfigOption;
    via_covering?: ConfigOption;
    min_via_hole_size?: ConfigOption;
    thickness_type?: ThicknessTypeConfig;
    stencil_side?: ConfigOption;
    stencil_process_type?: ConfigOption;
    fiducials?: ConfigOption;
    package_box?: ConfigOption;
    stencil_qty?: ConfigOption;
    pcb_color_silkscreen_map?: ColorSilkscreenMapping;
    framework?: ConfigOption;
    step_stencil?: ConfigOption;
    nano_coating?: ConfigOption;
    gerber?: { type: string; value: string };
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
          <div className="mb-8 flex items-center gap-3 border-b border-gray-200 pb-6 dark:border-gray-700">
            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
            <h2 className="text-body-lg font-bold text-dark dark:text-white">
              Basic Information
            </h2>
          </div>
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
            <div className="mb-8 flex items-center gap-3 border-b border-gray-200 pb-6 dark:border-gray-700">
              <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
              <h2 className="text-body-lg font-bold text-dark dark:text-white">
                Service Configuration
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(service.config).map(([fieldName, fieldConfig]: [string, any]) => {
                if (!fieldConfig) return null;
                
                const fieldLabel = fieldName
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase());

                if (fieldName === "dimension") {
                  return (
                    <div key={fieldName} className="rounded-lg border border-[#eee] p-5 dark:border-dark-3">
                      <h3 className="mb-5 text-base font-bold text-dark dark:text-white">{fieldLabel}</h3>
                      <div className="space-y-4">
                        {fieldConfig.unit && (
                          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Unit</p>
                            <p className="text-sm font-bold text-dark dark:text-white">{fieldConfig.unit}</p>
                          </div>
                        )}
                        {fieldConfig.min && (
                          <div>
                            <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Minimum</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400">X</p>
                                <p className="mt-1 text-sm font-bold text-dark dark:text-white">{fieldConfig.min.x}</p>
                              </div>
                              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Y</p>
                                <p className="mt-1 text-sm font-bold text-dark dark:text-white">{fieldConfig.min.y}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {fieldConfig.max && (
                          <div>
                            <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Maximum</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400">X</p>
                                <p className="mt-1 text-sm font-bold text-dark dark:text-white">{fieldConfig.max.x}</p>
                              </div>
                              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Y</p>
                                <p className="mt-1 text-sm font-bold text-dark dark:text-white">{fieldConfig.max.y}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (fieldName === "gerber") {
                  return (
                    <div key={fieldName} className="rounded-lg border border-[#eee] p-5 dark:border-dark-3">
                      <h3 className="mb-4 text-base font-bold text-dark dark:text-white">{fieldLabel}</h3>
                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                        <p className="text-sm font-semibold text-dark dark:text-white">{fieldConfig.value || "N/A"}</p>
                      </div>
                    </div>
                  );
                }

                if (fieldName === "pcb_color_silkscreen_map") {
                  return (
                    <div key={fieldName} className="rounded-lg border border-[#eee] p-5 dark:border-dark-3">
                      <h3 className="mb-4 text-base font-bold text-dark dark:text-white">{fieldLabel}</h3>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {fieldConfig.mapping && Object.entries(fieldConfig.mapping).map(([color, silkscreens]: [string, any]) => (
                          <div key={color} className="rounded-lg border border-[#eee] p-4 dark:border-dark-3">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: color.toLowerCase() }}></div>
                              <p className="text-sm font-semibold capitalize text-dark dark:text-white">{color}</p>
                            </div>
                            <div className="space-y-2">
                              {Array.isArray(silkscreens) && silkscreens.map((silkscreen: string, idx: number) => (
                                <div key={idx} className="flex items-center rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-700">
                                  <span className="text-xs font-medium text-dark dark:text-white">{silkscreen}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (fieldName === "pcb_type" && fieldConfig.flex_config) {
                  return (
                    <div key={fieldName} className="rounded-lg border border-[#eee] p-5 dark:border-dark-3">
                      <h3 className="mb-5 text-base font-bold text-dark dark:text-white">{fieldLabel}</h3>
                      
                      {fieldConfig.options && Array.isArray(fieldConfig.options) && fieldConfig.options.length > 0 && (
                        <div className="mb-6 rounded-lg border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                          <p className="mb-3 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">PCB Type Options</p>
                          <div className="flex flex-wrap gap-3">
                            {fieldConfig.options.map((option: string | number, index: number) => (
                              <div key={`pcb_type-${option}-${index}`} className="rounded-lg bg-white px-4 py-2.5 font-semibold text-dark shadow-sm dark:bg-gray-700 dark:text-white">
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(fieldConfig.flex_config.material?.options || fieldConfig.flex_config.surface_finish?.options || fieldConfig.flex_config.fpc_thickness?.options) && (
                        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/15">
                          <p className="mb-4 text-sm font-bold text-blue-900 dark:text-blue-200">Flex Configuration Options</p>
                          <div className="space-y-4">
                            {fieldConfig.flex_config.material?.options && fieldConfig.flex_config.material.options.length > 0 && (
                              <div className="rounded-lg bg-white p-3 dark:bg-blue-900/20">
                                <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Material</p>
                                <div className="flex flex-wrap gap-2">
                                  {fieldConfig.flex_config.material.options.map((option: string | number, index: number) => (
                                    <span key={`material-${option}-${index}`} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-100">{option}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {fieldConfig.flex_config.surface_finish?.options && fieldConfig.flex_config.surface_finish.options.length > 0 && (
                              <div className="rounded-lg bg-white p-3 dark:bg-blue-900/20">
                                <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Surface Finish</p>
                                <div className="flex flex-wrap gap-2">
                                  {fieldConfig.flex_config.surface_finish.options.map((option: string | number, index: number) => (
                                    <span key={`surface_finish-${option}-${index}`} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-100">{option}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {fieldConfig.flex_config.fpc_thickness?.options && fieldConfig.flex_config.fpc_thickness.options.length > 0 && (
                              <div className="rounded-lg bg-white p-3 dark:bg-blue-900/20">
                                <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">FPC Thickness</p>
                                <div className="flex flex-wrap gap-2">
                                  {fieldConfig.flex_config.fpc_thickness.options.map((option: string | number, index: number) => (
                                    <span key={`fpc_thickness-${option}-${index}`} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-100">{option}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (fieldName === "thickness_type" && fieldConfig.custom_config) {
                  return (
                    <div key={fieldName} className="rounded-lg border border-[#eee] p-5 dark:border-dark-3">
                      <h3 className="mb-5 text-base font-bold text-dark dark:text-white">{fieldLabel}</h3>
                      
                      {fieldConfig.options && Array.isArray(fieldConfig.options) && fieldConfig.options.length > 0 && (
                        <div className="mb-6 rounded-lg border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                          <p className="mb-3 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Thickness Type Options</p>
                          <div className="flex flex-wrap gap-3">
                            {fieldConfig.options.map((option: string | number, index: number) => (
                              <div key={`thickness_type-${option}-${index}`} className="rounded-lg bg-white px-4 py-2.5 text-md text-dark shadow-sm dark:bg-gray-700 dark:text-white">
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {fieldConfig.custom_config.custom_thickness_options?.options && fieldConfig.custom_config.custom_thickness_options.options.length > 0 && (
                        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/15">
                          <p className="mb-4 text-sm font-bold text-blue-900 dark:text-blue-200">Custom Thickness Options</p>
                          <div className="rounded-lg bg-white p-3 dark:bg-blue-900/20">
                            <div className="flex flex-wrap gap-2">
                              {fieldConfig.custom_config.custom_thickness_options.options.map((option: string | number, index: number) => (
                                <span key={`custom_thickness-${option}-${index}`} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-100">{option}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (fieldConfig.options && Array.isArray(fieldConfig.options) && fieldConfig.options.length > 0) {
                  return (
                    <div key={fieldName} className="rounded-lg border border-[#eee] p-5 dark:border-dark-3">
                      <h3 className="mb-4 text-sm font-semibold text-dark dark:text-white">{fieldLabel}</h3>
                      <div className="flex flex-wrap gap-3">
                        {fieldConfig.options.map((option: string | number, index: number) => (
                          <div key={`${fieldName}-${option}-${index}`} className="flex items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 py-2.5 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                            <span className="text-sm font-medium text-dark dark:text-white">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (fieldConfig.multiplier && Object.keys(fieldConfig.multiplier).length > 0) {
                  return (
                    <div key={fieldName} className="rounded-lg border border-[#eee] p-5 dark:border-dark-3">
                      <h3 className="mb-4 text-sm font-semibold text-dark dark:text-white">{fieldLabel}</h3>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {Object.entries(fieldConfig.multiplier).map(([key, value]: [string, any]) => (
                          <div key={key} className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-3 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{key}</p>
                            <p className="mt-2 text-lg font-semibold text-primary">{value}x</p>
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
            <div className="mb-8 flex items-center gap-3 border-b border-gray-200 pb-6 dark:border-gray-700">
              <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
              <h2 className="text-body-lg font-bold text-dark dark:text-white">
                Lead Times
              </h2>
            </div>
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
          <div className="mb-8 flex items-center gap-3 border-b border-gray-200 pb-6 dark:border-gray-700">
            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
            <h2 className="text-body-lg font-bold text-dark dark:text-white">
              Metadata
            </h2>
          </div>
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
