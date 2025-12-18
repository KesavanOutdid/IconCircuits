"use client";

import { apiCall } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import ServiceCards from "../service-cards";

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

interface ServiceConfig {
  layers?: ConfigOption;
  components?: ConfigOption;
  lead_time_days?: ConfigOption;
  controlled_impedance?: ConfigOption;
  pcb_type?: ConfigOption;
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
  const [minMultipliers, setMinMultipliers] = useState<Record<string, number>>({
    layers: 1,
    components: 1,
    lead_time_days: 1,
    controlled_impedance: 1,
    pcb_type: 1,
    delivery_format: 1,
    material: 1,
    surface_finish: 1,
    fpc_thickness: 1,
  });
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
      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [fieldName]: {
            type: fieldName === "controlled_impedance" ? "boolean" : "select",
            options: [],
            multiplier: {},
          },
        },
      }));
      return;
    }

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

    const newMultipliers: Record<string, number> = {};
    const minMult = minMultipliers[fieldName] || 1;
    const MULTIPLIER = 1.2;

    options.forEach((opt, index) => {
      const key = String(opt);
      const existingValue = (formData.config as any)[fieldName]?.multiplier?.[key];
      if (existingValue) {
        newMultipliers[key] = existingValue;
      } else if (fieldName === "controlled_impedance") {
        newMultipliers[key] = key === "true" ? 1 : 0;
      } else if (fieldName === "delivery_format") {
        newMultipliers[key] = 1;
      } else {
        const reversedIndex = fieldName === "lead_time_days" ? (options.length - 1 - index) : index;
        newMultipliers[key] = parseFloat((minMult * Math.pow(MULTIPLIER, reversedIndex)).toFixed(2));
      }
    });

    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [fieldName]: {
          type: fieldName === "controlled_impedance" ? "boolean" : "select",
          options: options,
          multiplier: newMultipliers,
        },
      },
    }));
  };

  const removeOption = (fieldName: string, option: string | number) => {
    setFormData((prev) => {
      const currentOptions = prev.config[fieldName as keyof ServiceConfig]?.options || [];
      const newOptions = currentOptions.filter((opt) => String(opt) !== String(option));
      const { [String(option)]: removed, ...newMultipliers } = prev.config[fieldName as keyof ServiceConfig]?.multiplier || {};

      return {
        ...prev,
        config: {
          ...prev.config,
          [fieldName]: {
            ...prev.config[fieldName as keyof ServiceConfig],
            options: newOptions,
            multiplier: newMultipliers,
          },
        },
      };
    });
  };

  const handleMultiplierChange = (fieldName: string, optionValue: string, multiplierValue: number) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [fieldName]: {
          ...prev.config[fieldName as keyof ServiceConfig],
          multiplier: {
            ...prev.config[fieldName as keyof ServiceConfig]?.multiplier,
            [optionValue]: multiplierValue,
          },
        },
      },
    }));
  };

  const isFlexSelected = () => {
    const pcbTypeConfig = formData.config.pcb_type;
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

    if (isFlexSelected()) {
      const flexRequiredFields = ["material", "surface_finish", "fpc_thickness"];
      for (const field of flexRequiredFields) {
        const config = data.config[field as keyof ServiceConfig];
        if (!config?.options || config.options.length === 0) {
          Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS[field]} is required for Flex PCB` });
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let updatedConfig: ServiceConfig = {};
    const fieldsToProcess = [...REQUIRED_FIELDS];
    
    if (isFlexSelected()) {
      fieldsToProcess.push("material", "surface_finish", "fpc_thickness");
    }

    for (const fieldName of fieldsToProcess) {
      const input = inputValues[fieldName] || "";
      if (input.trim()) {
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

        const newMultipliers: Record<string, number> = {};
        const minMult = minMultipliers[fieldName] || 1;
        const MULTIPLIER = 1.2;

        options.forEach((opt, index) => {
          const optKey = String(opt);
          const existingValue = (formData.config as any)[fieldName]?.multiplier?.[optKey];
          if (existingValue) {
            newMultipliers[optKey] = existingValue;
          } else if (fieldName === "controlled_impedance") {
            newMultipliers[optKey] = optKey === "true" ? 1 : 0;
          } else if (fieldName === "delivery_format") {
            newMultipliers[optKey] = 1;
          } else {
            const reversedIndex = fieldName === "lead_time_days" ? (options.length - 1 - index) : index;
            newMultipliers[optKey] = parseFloat((minMult * Math.pow(MULTIPLIER, reversedIndex)).toFixed(2));
          }
        });

        (updatedConfig as any)[fieldName] = {
          type: fieldName === "controlled_impedance" ? "boolean" : "select",
          options: options,
          multiplier: newMultipliers,
        };
      }
    }

    if (dimensionConfig.x_max && dimensionConfig.y_max) {
      (updatedConfig as any).dimension = {
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

    if (isFlexSelected()) {
      const flexRequiredFields = ["material", "surface_finish", "fpc_thickness"];
      for (const field of flexRequiredFields) {
        const config = formData.config[field as keyof ServiceConfig];
        if (!config?.options || config.options.length === 0) {
          return false;
        }
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
          <div className="grid grid-cols-3 gap-6">
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

            <div>
              <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                Base Price (₹)
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                onWheel={(e) => e.currentTarget.blur()}
                min="0"
                step="0.01"
                placeholder="e.g., 5000"
                className="w-full rounded border border-[#E8E8E8] bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-[#F5F7F9] dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
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

            <div className="space-y-8">
              {["layers", "components", "lead_time_days", "controlled_impedance", "pcb_type", "delivery_format"].map((fieldName) => (
                <div key={fieldName}>
                  <label className="mb-3 block text-md font-bold text-dark dark:text-white">
                    {FIELD_LABELS[fieldName]} <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Min Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={minMultipliers[fieldName]}
                          onChange={(e) =>
                            setMinMultipliers((prev) => ({
                              ...prev,
                              [fieldName]: parseFloat(e.target.value) || 1,
                            }))
                          }
                          className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputValues[fieldName]}
                        onChange={(e) => handleConfigInputChange(fieldName, e.target.value)}
                        placeholder={FIELD_PLACEHOLDERS[fieldName] || "Enter options separated by commas"}
                        className="flex-1 rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-base text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => parseAndSetOptions(fieldName)}
                        className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                      >
                        Add Options
                      </button>
                    </div>

                    {(formData.config[fieldName as keyof ServiceConfig]?.options || []).length > 0 && (
                      <div className="space-y-2 rounded border border-[#E8E8E8] p-3 dark:border-form-strokedark">
                        {(formData.config[fieldName as keyof ServiceConfig]?.options || []).map((option) => {
                          const multiplier = formData.config[fieldName as keyof ServiceConfig]?.multiplier?.[String(option)] || 1.0;
                          return (
                            <div key={option} className="flex items-center justify-between gap-2 rounded border border-[#E8E8E8] p-2 dark:border-form-strokedark">
                              <div className="flex-1">
                                <span className="text-base font-medium text-dark dark:text-white">
                                  {option}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {fieldName === "delivery_format" ? (
                                  <span className="text-sm text-gray-600 dark:text-gray-400 w-24 text-center">
                                    {multiplier}
                                  </span>
                                ) : (
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    value={multiplier}
                                    onChange={(e) =>
                                      handleMultiplierChange(fieldName, String(option), parseFloat(e.target.value) || 1)
                                    }
                                    className="w-24 rounded border border-[#E8E8E8] bg-transparent px-2 py-1 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeOption(fieldName, option)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isFlexSelected() && (
                <>
                  {["material", "surface_finish", "fpc_thickness"].map((fieldName) => (
                    <div key={fieldName}>
                      <label className="mb-3 block text-md font-bold text-dark dark:text-white">
                        {FIELD_LABELS[fieldName]} <span className="text-red-500">*</span>
                      </label>

                      <div className="space-y-3">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                              Min Multiplier
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={minMultipliers[fieldName]}
                              onChange={(e) =>
                                setMinMultipliers((prev) => ({
                                  ...prev,
                                  [fieldName]: parseFloat(e.target.value) || 1,
                                }))
                              }
                              className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inputValues[fieldName]}
                            onChange={(e) => handleConfigInputChange(fieldName, e.target.value)}
                            placeholder={FIELD_PLACEHOLDERS[fieldName] || "Enter options separated by commas"}
                            className="flex-1 rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-base text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => parseAndSetOptions(fieldName)}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                          >
                            Add Options
                          </button>
                        </div>

                        {(formData.config[fieldName as keyof ServiceConfig]?.options || []).length > 0 && (
                          <div className="space-y-2 rounded border border-[#E8E8E8] p-3 dark:border-form-strokedark">
                            {(formData.config[fieldName as keyof ServiceConfig]?.options || []).map((option) => {
                              const multiplier = formData.config[fieldName as keyof ServiceConfig]?.multiplier?.[String(option)] || 1.0;
                              return (
                                <div key={option} className="flex items-center justify-between gap-2 rounded border border-[#E8E8E8] p-2 dark:border-form-strokedark">
                                  <div className="flex-1">
                                    <span className="text-base font-medium text-dark dark:text-white">
                                      {option}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0.1"
                                      value={multiplier}
                                      onChange={(e) =>
                                        handleMultiplierChange(fieldName, String(option), parseFloat(e.target.value) || 1)
                                      }
                                      className="w-24 rounded border border-[#E8E8E8] bg-transparent px-2 py-1 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeOption(fieldName, option)}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="rounded-lg border border-[#E8E8E8] p-6 dark:border-form-strokedark">
                <label className="mb-4 block text-lg font-bold text-dark dark:text-white">
                  {FIELD_LABELS.dimension}
                </label>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-dark dark:text-white">
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

                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-dark dark:text-white">
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
                    <h4 className="mb-3 text-sm font-semibold text-dark dark:text-white">
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
