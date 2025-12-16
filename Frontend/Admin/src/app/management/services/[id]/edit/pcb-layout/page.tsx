"use client";

import { apiCall } from "@/lib/api-client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

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
  _id?: string;
  service_id?: number;
  name: string;
  code: string;
  description: string;
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
  dimension: "PCB Dimension",
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  layers: "e.g., 1,2,3,4",
  components: "e.g., 25,100,230",
  lead_time_days: "e.g., 2,3,4",
  controlled_impedance: "true,false",
  pcb_type: "e.g., Regular rigid flex",
  delivery_format: "e.g., Gerber,BOM,DXF",
};

const REQUIRED_FIELDS = ["layers", "components", "lead_time_days", "controlled_impedance", "pcb_type", "delivery_format", "dimension"];

export default function EditPCBLayout() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id as string;

  const MAX_SERVICE_NAME = 100;
  const MAX_SERVICE_CODE = 50;
  const MAX_DESCRIPTION = 500;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [initialData, setInitialData] = useState<ServiceData | null>(null);
  const [minMultipliers, setMinMultipliers] = useState<Record<string, number>>({
    layers: 1,
    components: 1,
    lead_time_days: 1,
    controlled_impedance: 1,
    pcb_type: 1,
    delivery_format: 1,
  });
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    layers: "",
    components: "",
    lead_time_days: "",
    controlled_impedance: "true,false",
    pcb_type: "",
    delivery_format: "",
  });

  const [dimensionData, setDimensionData] = useState<DimensionConfig>({
    type: "numeric_xy",
    unit: "mm",
    min: { x: 0, y: 0 },
    max: { x: 0, y: 0 },
    area_pricing: {
      slabs: [],
    },
  });

  const [formData, setFormData] = useState<ServiceData>({
    name: "",
    code: "",
    description: "",
    base_price: 0,
    status: true,
    config: {},
  });

  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  const fetchServiceData = async () => {
    try {
      setPageLoading(true);
      const data = await apiCall<any>(`/api/admin/services/${serviceId}`);
      
      const processedData: ServiceData = {
        ...data,
        config: data.config || {},
      };

      setInitialData(processedData);
      setFormData(processedData);
      initializeInputValues(processedData.config);
      
      if (processedData.config?.dimension) {
        setDimensionData(processedData.config.dimension);
      }
    } catch (error) {
      console.error("Failed to fetch service:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load service data",
      });
      router.back();
    } finally {
      setPageLoading(false);
    }
  };

  const initializeInputValues = (config: ServiceConfig) => {
    const newInputValues: Record<string, string> = { ...inputValues };

    REQUIRED_FIELDS.forEach((field) => {
      if (field === "dimension") return;
      const fieldConfig = config[field as keyof ServiceConfig];
      if (fieldConfig?.options && Array.isArray(fieldConfig.options)) {
        newInputValues[field] = fieldConfig.options.join(", ");
      }
    });

    setInputValues(newInputValues);
  };

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

    const options = input.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
    const numericOptions = options.map((opt) => {
      const num = parseFloat(opt);
      return isNaN(num) ? opt : num;
    });

    const newMultipliers: Record<string, number> = {};
    const minMult = minMultipliers[fieldName] || 1;
    const MULTIPLIER = 1.2;

    numericOptions.forEach((opt, index) => {
      const key = String(opt);
      const existingValue = (formData.config as any)[fieldName]?.multiplier?.[key];
      if (existingValue) {
        newMultipliers[key] = existingValue;
      } else {
        newMultipliers[key] = parseFloat((minMult * Math.pow(MULTIPLIER, index)).toFixed(2));
      }
    });

    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [fieldName]: {
          type: fieldName === "controlled_impedance" ? "boolean" : "select",
          options: numericOptions,
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

    setInputValues((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName]
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && String(item) !== String(option))
        .join(", "),
    }));
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

  const addAreaSlab = () => {
    setDimensionData((prev) => ({
      ...prev,
      area_pricing: {
        ...prev.area_pricing!,
        slabs: [...prev.area_pricing!.slabs, { min: 0, max: 0, multiplier: 1 }],
      },
    }));
  };

  const removeAreaSlab = (index: number) => {
    setDimensionData((prev) => ({
      ...prev,
      area_pricing: {
        ...prev.area_pricing!,
        slabs: prev.area_pricing!.slabs.filter((_, i) => i !== index),
      },
    }));
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
      if (field === "dimension") {
        if (!data.config.dimension) {
          Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS[field]} is required` });
          return false;
        }
      } else {
        const config = data.config[field as keyof ServiceConfig];
        if (!config?.options || config.options.length === 0) {
          Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS[field]} is required` });
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let updatedConfig: ServiceConfig = {};

    for (const fieldName of REQUIRED_FIELDS) {
      if (fieldName === "dimension") {
        (updatedConfig as any).dimension = dimensionData;
      } else {
        const input = inputValues[fieldName] || "";
        if (input.trim()) {
          const options = input.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
          const numericOptions = options.map((opt) => {
            const num = parseFloat(opt);
            return isNaN(num) ? opt : num;
          });

          const newMultipliers: Record<string, number> = {};
          const minMult = minMultipliers[fieldName] || 1;
          const MULTIPLIER = 1.2;

          numericOptions.forEach((opt, index) => {
            const optKey = String(opt);
            const existingValue = (formData.config as any)[fieldName]?.multiplier?.[optKey];
            if (existingValue) {
              newMultipliers[optKey] = existingValue;
            } else {
              newMultipliers[optKey] = parseFloat((minMult * Math.pow(MULTIPLIER, index)).toFixed(2));
            }
          });

          (updatedConfig as any)[fieldName] = {
            type: fieldName === "controlled_impedance" ? "boolean" : "select",
            options: numericOptions,
            multiplier: newMultipliers,
          };
        }
      }
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
      console.log("Updating:", finalFormData);
      await apiCall(`/api/admin/services/${serviceId}`, {
        method: "PUT",
        body: JSON.stringify(finalFormData),
      });

      await Swal.fire({
        icon: "success",
        title: "Service Updated!",
        text: "Service has been successfully updated.",
        confirmButtonText: "OK",
      });

      router.push("/management/services");
    } catch (error) {
      console.error("Failed to update service:", error);
      setLoading(false);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to update service",
      });
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark dark:text-white">Loading...</p>
      </div>
    );
  }

  const hasDataChanged = () => {
    if (!initialData) return false;

    if (formData.name !== initialData.name ||
        formData.code !== initialData.code ||
        formData.description !== initialData.description ||
        formData.base_price !== initialData.base_price ||
        formData.status !== initialData.status) {
      return true;
    }

    if (JSON.stringify(dimensionData) !== JSON.stringify(initialData.config?.dimension)) {
      return true;
    }

    for (const field of REQUIRED_FIELDS) {
      if (field === "dimension") continue;
      const currentConfig = formData.config[field as keyof ServiceConfig];
      const initialConfig = initialData.config?.[field as keyof ServiceConfig];

      if (JSON.stringify(currentConfig) !== JSON.stringify(initialConfig)) {
        return true;
      }
    }

    return false;
  };

  const isFormValid = () => {
    if (!formData.name.trim() || !formData.code.trim() || !formData.description.trim()) {
      return false;
    }

    for (const field of REQUIRED_FIELDS) {
      if (field === "dimension") {
        if (!dimensionData || !dimensionData.max) {
          return false;
        }
      } else {
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
          EDIT PCB LAYOUT SERVICE
        </h1>
        <button
          onClick={() => router.push("/management/services")}
          className="inline-flex items-center justify-center rounded-lg bg-gray-300 px-5 py-2 text-sm font-medium text-dark hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          Back
        </button>
      </div>

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

              <div>
                <label className="mb-3 block text-md font-bold text-dark dark:text-white">
                  {FIELD_LABELS["dimension"]} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Min X (mm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dimensionData.min.x}
                        onChange={(e) =>
                          setDimensionData((prev) => ({
                            ...prev,
                            min: { ...prev.min, x: parseFloat(e.target.value) || 0 },
                          }))
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Min Y (mm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dimensionData.min.y}
                        onChange={(e) =>
                          setDimensionData((prev) => ({
                            ...prev,
                            min: { ...prev.min, y: parseFloat(e.target.value) || 0 },
                          }))
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Max X (mm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dimensionData.max.x}
                        onChange={(e) =>
                          setDimensionData((prev) => ({
                            ...prev,
                            max: { ...prev.max, x: parseFloat(e.target.value) || 0 },
                          }))
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Max Y (mm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dimensionData.max.y}
                        onChange={(e) =>
                          setDimensionData((prev) => ({
                            ...prev,
                            max: { ...prev.max, y: parseFloat(e.target.value) || 0 },
                          }))
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    </div>
                  </div>

                  {dimensionData.area_pricing && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-dark dark:text-white">
                          Area Pricing Slabs
                        </h4>
                        <button
                          type="button"
                          onClick={addAreaSlab}
                          className="rounded bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90"
                        >
                          + Add Slab
                        </button>
                      </div>
                      <div className="space-y-2">
                        {dimensionData.area_pricing.slabs.map((slab, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                Min Area
                              </label>
                              <input
                                type="number"
                                value={slab.min}
                                onChange={(e) => {
                                  const newSlabs = [...dimensionData.area_pricing!.slabs];
                                  newSlabs[index].min = parseFloat(e.target.value) || 0;
                                  setDimensionData((prev) => ({
                                    ...prev,
                                    area_pricing: {
                                      ...prev.area_pricing!,
                                      slabs: newSlabs,
                                    },
                                  }));
                                }}
                                className="w-full rounded border border-[#E8E8E8] bg-transparent px-2 py-1 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                Max Area
                              </label>
                              <input
                                type="number"
                                value={slab.max}
                                onChange={(e) => {
                                  const newSlabs = [...dimensionData.area_pricing!.slabs];
                                  newSlabs[index].max = parseFloat(e.target.value) || 0;
                                  setDimensionData((prev) => ({
                                    ...prev,
                                    area_pricing: {
                                      ...prev.area_pricing!,
                                      slabs: newSlabs,
                                    },
                                  }));
                                }}
                                className="w-full rounded border border-[#E8E8E8] bg-transparent px-2 py-1 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Multiplier
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={slab.multiplier}
                                  onChange={(e) => {
                                    const newSlabs = [...dimensionData.area_pricing!.slabs];
                                    newSlabs[index].multiplier = parseFloat(e.target.value) || 1;
                                    setDimensionData((prev) => ({
                                      ...prev,
                                      area_pricing: {
                                        ...prev.area_pricing!,
                                        slabs: newSlabs,
                                      },
                                    }));
                                  }}
                                  className="w-full rounded border border-[#E8E8E8] bg-transparent px-2 py-1 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAreaSlab(index)}
                                className="mb-1 text-red-500 hover:text-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || !isFormValid() || !hasDataChanged()}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:bg-gray-300 dark:disabled:bg-gray-600"
            >
              {loading ? "Updating..." : "Update Service"}
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
