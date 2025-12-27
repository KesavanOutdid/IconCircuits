"use client";

import { apiCall } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import ServiceCards from "../service-cards";
import { TrashIcon } from "@/assets/icons";

interface ConfigOption {
  type: string;
  options?: (string | number)[];
  multiplier?: Record<string, number>;
}

interface AreaSlab {
  min: number;
  max: number;
  multiplier: number;
}

interface DimensionConfig {
  type: string;
  unit: string;
  min: { x: number; y: number };
  max: { x: number; y: number };
  area_pricing?: {
    slabs: AreaSlab[];
  };
}

interface FlexConfig {
  material?: ConfigOption;
  surface_finish?: ConfigOption;
  fpc_thickness?: ConfigOption;
}

interface PcbTypeConfig extends ConfigOption {
  flex_config?: FlexConfig;
}

interface ServiceConfig {
  layers?: ConfigOption;
  components?: ConfigOption;
  lead_time_days?: ConfigOption;
  controlled_impedance?: ConfigOption;
  pcb_type?: PcbTypeConfig;
  delivery_format?: ConfigOption;
  dimension?: DimensionConfig;
}

interface ServiceData {
  name: string;
  code: string;
  description: string;
  category: string;
  service_type: string;
  base_price: number;
  status: boolean;
  config: ServiceConfig;
}

const FIELD_LABELS: Record<string, string> = {
  layers: "Layer",
  components: "No. of Components",
  lead_time_days: "Lead Time",
  controlled_impedance: "Control Impedance",
  pcb_type: "PCB Type",
  delivery_format: "Delivery Format",
  material: "Material",
  surface_finish: "Surface Finish",
  fpc_thickness: "FPC Thickness",
  dimension: "PCB Dimension",
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  layers: "e.g., 1,2,3,4",
  components: "e.g., 0-75,75-500,500+",
  lead_time_days: "e.g., 2,3,4",
  controlled_impedance: "true,false",
  pcb_type: "e.g., regular,flex",
  delivery_format: "e.g., Gerber,BOM,DXF",
  material: "e.g., Polymide",
  surface_finish: "e.g., Copper,Electroless Nickel Immersion Gold,Immersion Tin",
  fpc_thickness: "e.g., 0.0031\"/0.08mm,0.0047\"/0.12mm",
};

const REQUIRED_FIELDS = ["layers", "components", "lead_time_days", "controlled_impedance", "pcb_type", "delivery_format"];

export default function AddPCBLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    layers: "2,4,6,8",
    components: "0-75,75-500,500+",
    lead_time_days: "2,3,5,7",
    controlled_impedance: "true,false",
    pcb_type: "regular,flex",
    delivery_format: "Gerber,BOM,DXF",
    material: "Polyimide",
    surface_finish: "Copper,ENIG,Immersion Tin",
    fpc_thickness: "0.0031\"/0.08mm,0.0047\"/0.12mm",
  });

  const [formData, setFormData] = useState<ServiceData>({
    name: "",
    code: "",
    description: "",
    category: "",
    service_type: "pcb_layout",
    base_price: 0,
    status: true,
    config: {},
  });

  const [dimensionConfig, setDimensionConfig] = useState({
    unit: "mm",
    x_min: "",
    x_max: "",
    y_min: "",
    y_max: "",
  });

  const MAX_SERVICE_NAME = 100;
  const MAX_SERVICE_CODE = 50;
  const MAX_DESCRIPTION = 500;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === "name" && value.length > MAX_SERVICE_NAME) return;
    if (name === "code" && value.length > MAX_SERVICE_CODE) return;
    if (name === "description" && value.length > MAX_DESCRIPTION) return;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleConfigInputChange = (fieldName: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleDimensionChange = (field: string, value: string) => {
    setDimensionConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const parseAndSetOptions = (fieldName: string) => {
    const input = inputValues[fieldName];
    if (!input.trim()) {
      if (fieldName === "pcb_type") {
        setFormData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            [fieldName]: {
              type: "select",
              options: [],
            } as PcbTypeConfig,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            [fieldName]: {
              type: fieldName === "controlled_impedance" ? "boolean" : "select",
              options: [],
            },
          },
        }));
      }
      return;
    }

    const options = parseOptions(input);

    if (fieldName === "pcb_type") {
      const newConfig: PcbTypeConfig = {
        type: "select",
        options: options,
      };

      const currentConfig = formData.config.pcb_type as PcbTypeConfig | undefined;
      if (currentConfig?.flex_config) {
        newConfig.flex_config = currentConfig.flex_config;
      }

      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          pcb_type: newConfig,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [fieldName]: {
            type: fieldName === "controlled_impedance" ? "boolean" : "select",
            options: options,
          },
        },
      }));
    }
  };

  const parseOptions = (input: string): (string | number)[] => {
    const items = input.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
    const options: (string | number)[] = [];

    items.forEach((item) => {
      const hasSpecialChars = item.includes("/") || item.includes('"') || item.includes("'");
      
      if (item.includes("-") && !hasSpecialChars) {
        const parts = item.split("-");
        if (parts.length === 2) {
          const start = parseFloat(parts[0].trim());
          const end = parseFloat(parts[1].trim());
          if (!isNaN(start) && !isNaN(end)) {
            options.push(item);
          } else {
            options.push(item);
          }
        } else {
          options.push(item);
        }
      } else if (!hasSpecialChars) {
        const num = parseFloat(item);
        options.push(isNaN(num) ? item : num);
      } else {
        options.push(item);
      }
    });

    return options;
  };

  const removeOption = (fieldName: string, option: string | number, parentField?: string) => {
    setFormData((prev) => {
      if (parentField === "material" || parentField === "surface_finish" || parentField === "fpc_thickness") {
        const pcbTypeConfig = prev.config.pcb_type as PcbTypeConfig | undefined;
        if (!pcbTypeConfig?.flex_config) return prev;

        const field = parentField as "material" | "surface_finish" | "fpc_thickness";
        const currentOptions = pcbTypeConfig.flex_config[field]?.options || [];
        const newOptions = currentOptions.filter((opt) => String(opt) !== String(option));

        return {
          ...prev,
          config: {
            ...prev.config,
            pcb_type: {
              ...pcbTypeConfig,
              flex_config: {
                ...pcbTypeConfig.flex_config,
                [field]: {
                  type: "select",
                  options: newOptions,
                },
              },
            },
          },
        };
      } else {
        const currentOptions = prev.config[fieldName as keyof ServiceConfig]?.options || [];
        const newOptions = currentOptions.filter((opt) => String(opt) !== String(option));

        return {
          ...prev,
          config: {
            ...prev.config,
            [fieldName]: {
              ...prev.config[fieldName as keyof ServiceConfig],
              options: newOptions,
            },
          },
        };
      }
    });

    setInputValues((prev) => {
      const currentInput = prev[parentField || fieldName];
      const items = currentInput.split(",").map((item) => item.trim());
      const filteredItems = items.filter((item) => item !== String(option));
      return {
        ...prev,
        [parentField || fieldName]: filteredItems.join(","),
      };
    });
  };

  const parseAndSetFlexOptions = (fieldName: "material" | "surface_finish" | "fpc_thickness") => {
    const input = inputValues[fieldName];
    const options = parseOptions(input);

    setFormData((prev) => {
      const pcbTypeConfig = (prev.config.pcb_type as PcbTypeConfig) || { type: "select", options: [] };
      const flexConfig = pcbTypeConfig.flex_config || {};

      return {
        ...prev,
        config: {
          ...prev.config,
          pcb_type: {
            ...pcbTypeConfig,
            flex_config: {
              ...flexConfig,
              [fieldName]: {
                type: "select",
                options: options,
              },
            },
          } as PcbTypeConfig,
        },
      };
    });
  };

  const isFlexSelected = () => {
    const pcbTypeConfig = formData.config.pcb_type as PcbTypeConfig | undefined;
    return pcbTypeConfig?.options?.some((opt) => String(opt).toLowerCase().includes("flex"));
  };

  const validateForm = (data: ServiceData): boolean => {
    if (!data.name.trim()) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "PCB Name is required" });
      return false;
    }
    if (!data.code.trim()) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Service Code is required" });
      return false;
    }
    if (!data.description.trim()) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Description is required" });
      return false;
    }

    for (const field of REQUIRED_FIELDS) {
      const config = data.config[field as keyof ServiceConfig];
      if (!config?.options || config.options.length === 0) {
        Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS[field]} is required` });
        return false;
      }
    }

    const pcbTypeConfig = data.config.pcb_type as PcbTypeConfig | undefined;
    const pcbTypeOptions = pcbTypeConfig?.options || [];
    if (pcbTypeOptions.some(opt => String(opt).toLowerCase() === "flex")) {
      const flexConfig = pcbTypeConfig?.flex_config;
      if (!flexConfig?.material?.options || flexConfig.material.options.length === 0) {
        Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS.material} is required for Flex PCB` });
        return false;
      }
      if (!flexConfig?.surface_finish?.options || flexConfig.surface_finish.options.length === 0) {
        Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS.surface_finish} is required for Flex PCB` });
        return false;
      }
      if (!flexConfig?.fpc_thickness?.options || flexConfig.fpc_thickness.options.length === 0) {
        Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS.fpc_thickness} is required for Flex PCB` });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let updatedConfig: ServiceConfig = {};
    const isPcbTypeFlex = inputValues.pcb_type?.toLowerCase().includes("flex");

    for (const fieldName of REQUIRED_FIELDS) {
      const input = inputValues[fieldName] || "";
      if (input.trim()) {
        const options = parseOptions(input);

        if (fieldName === "pcb_type") {
          const pcbTypeConfig: PcbTypeConfig = {
            type: "select",
            options: options,
          };

          if (isPcbTypeFlex) {
            pcbTypeConfig.flex_config = {
              material: inputValues.material?.trim() ? {
                type: "select",
                options: parseOptions(inputValues.material),
              } : undefined,
              surface_finish: inputValues.surface_finish?.trim() ? {
                type: "select",
                options: parseOptions(inputValues.surface_finish),
              } : undefined,
              fpc_thickness: inputValues.fpc_thickness?.trim() ? {
                type: "select",
                options: parseOptions(inputValues.fpc_thickness),
              } : undefined,
            };
          }

          updatedConfig.pcb_type = pcbTypeConfig;
        } else {
          (updatedConfig as any)[fieldName] = {
            type: fieldName === "controlled_impedance" ? "boolean" : "select",
            options: options,
          };
        }
      }
    }

    if (dimensionConfig.x_max && dimensionConfig.y_max) {
      updatedConfig.dimension = {
        type: "dimension",
        unit: dimensionConfig.unit,
        min: { x: parseFloat(dimensionConfig.x_min as string) || 0, y: parseFloat(dimensionConfig.y_min as string) || 0 },
        max: { x: parseFloat(dimensionConfig.x_max as string) || 0, y: parseFloat(dimensionConfig.y_max as string) || 0 },
      };
    }

    const finalFormData: ServiceData = {
      ...formData,
      config: updatedConfig,
    };

    if (!validateForm(finalFormData)) {
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting:", finalFormData);
      await apiCall("/api/admin/services", {
        method: "POST",
        body: JSON.stringify(finalFormData),
      });

      await Swal.fire({
        icon: "success",
        title: "Service Created!",
        text: "Service has been successfully added.",
        confirmButtonText: "OK",
      });

      router.push("/management/services");
    } catch (error) {
      console.error("Failed to add service:", error);
      setLoading(false);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to create service",
      });
    }
  };

  const isFormValid = () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.description.trim()) {
      return false;
    }

    for (const field of REQUIRED_FIELDS) {
      const config = formData.config[field as keyof ServiceConfig];
      if (!config?.options || config.options.length === 0) {
        return false;
      }
    }

    const pcbTypeConfig = formData.config.pcb_type as PcbTypeConfig | undefined;
    if (inputValues.pcb_type?.toLowerCase().includes("flex")) {
      const flexConfig = pcbTypeConfig?.flex_config;
      if (!flexConfig?.material?.options || flexConfig.material.options.length === 0) {
        return false;
      }
      if (!flexConfig?.surface_finish?.options || flexConfig.surface_finish.options.length === 0) {
        return false;
      }
      if (!flexConfig?.fpc_thickness?.options || flexConfig.fpc_thickness.options.length === 0) {
        return false;
      }
    }

    return true;
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-body-1xlg font-bold text-dark dark:text-white">
          ADD PCB LAYOUT SERVICE
        </h1>
        <button
          onClick={() => router.push("/management/services")}
          className="inline-flex items-center justify-center rounded-lg bg-gray-300 px-5 py-2 text-sm font-medium text-dark hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <ServiceCards currentService="pcb_layout" />

      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                PCB Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={MAX_SERVICE_NAME}
                placeholder="e.g., PCB Layout Design"
                className="w-full rounded border border-[#E8E8E8] bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-[#F5F7F9] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <div className="mt-1.5 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.name.length}/{MAX_SERVICE_NAME}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                Service Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                maxLength={MAX_SERVICE_CODE}
                placeholder="e.g., PCB_LAYOUT"
                className="w-full rounded border border-[#E8E8E8] bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-[#F5F7F9] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <div className="mt-1.5 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.code.length}/{MAX_SERVICE_CODE}
                </span>
              </div>
            </div>

          </div>

          <div>
            <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              maxLength={MAX_DESCRIPTION}
              placeholder="Enter detailed service description"
              rows={3}
              className="w-full rounded border border-[#E8E8E8] bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-[#F5F7F9] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <div className="mt-1.5 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={formData.status}
              onChange={handleInputChange}
              className="w-5 h-5"
            />
            <label htmlFor="status" className="text-base font-semibold text-dark dark:text-white">
              Active Status
            </label>
          </div>

          <hr className="border-[#E8E8E8] dark:border-dark-3" />

          <div>
            <h3 className="mb-6 text-lg font-bold text-dark dark:text-white">
              Configuration Fields
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {["layers", "components", "lead_time_days", "controlled_impedance", "pcb_type", "delivery_format"].map((fieldName) => (
                <div key={fieldName} className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
                  <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                    {FIELD_LABELS[fieldName]} <span className="text-red-500">*</span>
                  </label>

                  <div className="flex flex-col gap-3 flex-1 min-h-0">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputValues[fieldName]}
                        onChange={(e) => handleConfigInputChange(fieldName, e.target.value)}
                        placeholder={FIELD_PLACEHOLDERS[fieldName] || "Enter options separated by commas"}
                        className="flex-1 rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => parseAndSetOptions(fieldName)}
                        className="rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition-colors whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>

                    <div className="thin-primary-scrollbar flex-1 rounded border border-[#E8E8E8] dark:border-form-strokedark bg-gray-50 dark:bg-gray-700">
                      {(formData.config[fieldName as keyof ServiceConfig]?.options || []).length > 0 ? (
                        <div>
                          {(formData.config[fieldName as keyof ServiceConfig]?.options || []).map((option, idx) => (
                            <div key={option} className={`flex items-center justify-between px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm ${idx !== (formData.config[fieldName as keyof ServiceConfig]?.options || []).length - 1 ? 'border-b border-[#E8E8E8] dark:border-form-strokedark' : ''}`}>
                              <span className="font-medium text-dark dark:text-white truncate flex-1">
                                {option}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeOption(fieldName, option)}
                                className="inline-flex items-center justify-center text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
                                title="Delete option"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                          No options added
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isFlexSelected() && (
              <>
                <hr className="border-[#E8E8E8] dark:border-dark-3 my-6" />
                <h4 className="mb-4 text-base font-semibold text-dark dark:text-white">
                  Flex PCB Options <span className="text-red-500">*</span>
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  {["material" as const, "surface_finish" as const, "fpc_thickness" as const].map((fieldName) => {
                    const pcbTypeConfig = formData.config.pcb_type as PcbTypeConfig | undefined;
                    const flexConfig = pcbTypeConfig?.flex_config;
                    const options = flexConfig?.[fieldName]?.options || [];

                    return (
                      <div key={fieldName} className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
                        <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                          {FIELD_LABELS[fieldName]} <span className="text-red-500">*</span>
                        </label>

                        <div className="flex flex-col gap-3 flex-1 min-h-0">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={inputValues[fieldName]}
                              onChange={(e) => handleConfigInputChange(fieldName, e.target.value)}
                              placeholder={FIELD_PLACEHOLDERS[fieldName] || "Enter options separated by commas"}
                              className="flex-1 rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => parseAndSetFlexOptions(fieldName)}
                              className="rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition-colors whitespace-nowrap"
                            >
                              Add
                            </button>
                          </div>

                          <div className="thin-primary-scrollbar flex-1 rounded border border-[#E8E8E8] dark:border-form-strokedark bg-gray-50 dark:bg-gray-700">
                            {options.length > 0 ? (
                              <div>
                                {options.map((option, idx) => (
                                  <div key={option} className={`flex items-center justify-between px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm ${idx !== options.length - 1 ? 'border-b border-[#E8E8E8] dark:border-form-strokedark' : ''}`}>
                                    <span className="font-medium text-dark dark:text-white truncate flex-1">
                                      {option}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeOption(fieldName, option, fieldName)}
                                      className="inline-flex items-center justify-center text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
                                      title="Delete option"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                                No options added
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-6">
              <hr className="border-[#E8E8E8] dark:border-dark-3 mb-6" />
              <h4 className="mb-4 text-base font-semibold text-dark dark:text-white">
                {FIELD_LABELS.dimension}
              </h4>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                    Unit
                  </label>
                  <select
                    value={dimensionConfig.unit}
                    onChange={(e) => handleDimensionChange("unit", e.target.value)}
                    className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="inch">inch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="mb-3 text-base font-semibold text-dark dark:text-white">
                    X Axis
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Min
                      </label>
                      <input
                        type="text"
                        value={dimensionConfig.x_min}
                        onChange={(e) => handleDimensionChange("x_min", e.target.value)}
                        placeholder="Min value"
                        className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Max
                      </label>
                      <input
                        type="text"
                        value={dimensionConfig.x_max}
                        onChange={(e) => handleDimensionChange("x_max", e.target.value)}
                        placeholder="Max value"
                        className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-base font-semibold text-dark dark:text-white">
                    Y Axis
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Min
                      </label>
                      <input
                        type="text"
                        value={dimensionConfig.y_min}
                        onChange={(e) => handleDimensionChange("y_min", e.target.value)}
                        placeholder="Min value"
                        className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Max
                      </label>
                      <input
                        type="text"
                        value={dimensionConfig.y_max}
                        onChange={(e) => handleDimensionChange("y_max", e.target.value)}
                        placeholder="Max value"
                        className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Service"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-[#E8E8E8] px-6 py-2 text-sm font-medium text-dark hover:bg-gray-50 dark:border-form-strokedark dark:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
