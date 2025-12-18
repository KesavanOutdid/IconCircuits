"use client";

import { apiCall } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ServiceCards from "../service-cards";


interface ConfigOption {
  type: string;
  options?: (string | number)[];
  multiplier?: Record<string, number>;
  images?: Record<string, string>;
}

interface ServiceConfig {
  base_material?: ConfigOption;
  layers?: ConfigOption;
  pcb_quality?: ConfigOption;
  product_type?: ConfigOption;
  different_design?: ConfigOption;
  delivery_format?: ConfigOption;
  pcb_thickness?: ConfigOption;
  pcb_color?: ConfigOption;
  silkscreen?: ConfigOption;
  outer_copper_weight?: ConfigOption;
  via_covering?: ConfigOption;
  min_via_hole_size?: ConfigOption;
  board_outline_tolerance?: ConfigOption;
  framework?: ConfigOption;
  step_stencil?: ConfigOption;
  nano_coating?: ConfigOption;
  stencil_side?: ConfigOption;
  stencil_process_type?: ConfigOption;
  fiducials?: ConfigOption;
  package_box?: ConfigOption;
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
  base_material: "Base Material",
  layers: "Layers",
  pcb_quality: "PCB Quality",
  product_type: "Product Type",
  different_design: "Different Design",
  delivery_format: "Delivery Format",
  pcb_thickness: "PCB Thickness",
  pcb_color: "PCB Color",
  silkscreen: "Silkscreen",
  outer_copper_weight: "Outer Copper Weight",
  via_covering: "Via Covering",
  min_via_hole_size: "Min Via Hole Size/Diameter",
  board_outline_tolerance: "Board Outline Tolerance",
  framework: "Framework",
  step_stencil: "Step Stencil",
  nano_coating: "Nano-Coating",
  stencil_side: "Stencil Side",
  stencil_process_type: "Stencil Process Type",
  fiducials: "Fiducials",
  package_box: "Package Box",
  stencil_qty: "Stencil Qty",
  thickness_type: "Thickness Type",
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  base_material: "e.g., Fr4,Flex,Aluminum,Copper Core",
  layers: "e.g., 2,3,4",
  pcb_quality: "e.g., 6",
  product_type: "e.g., aerospace,industrial",
  different_design: "e.g., 1,2,3,4",
  delivery_format: "e.g., Gerber,BOM,DXF",
  pcb_thickness: "e.g., 0.2mm,0.4mm",
  pcb_color: "e.g., green,yellow,red,blue",
  silkscreen: "e.g., white,black,yellow",
  outer_copper_weight: "e.g., 1 oz,2 oz",
  via_covering: "e.g., Tented,unTented",
  min_via_hole_size: "e.g., 0.25mm/(0.35/0.4mm),0.2mm/(0.3/0.35mm)",
  board_outline_tolerance: "e.g., +_0.2mm(Regular),+_0.1mm(High Precision)",
  framework: "e.g., yes,no",
  step_stencil: "e.g., yes,no",
  nano_coating: "e.g., yes,no",
  stencil_side: "e.g., top only,bottom only,both",
  stencil_process_type: "e.g., solder paste stencil,red glue stencil",
  fiducials: "e.g., no fiducal,etched through",
  package_box: "e.g., with logo,blank",
  stencil_qty: "e.g., 1,2,5,10",
  thickness_type: "e.g., Select by IconCircuit,Select by Custom",
};

const REQUIRED_FIELDS = ["base_material", "layers", "pcb_quality", "product_type", "different_design", "delivery_format", "pcb_thickness", "pcb_color", "silkscreen"];
const HIGHSPEC_FIELDS = ["outer_copper_weight", "via_covering", "min_via_hole_size", "board_outline_tolerance"];
const STENCIL_FIELDS = ["framework", "step_stencil", "nano_coating", "stencil_side", "stencil_process_type", "fiducials", "package_box", "stencil_qty", "thickness_type"];

export default function AddPCBFabrication() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [minMultipliers, setMinMultipliers] = useState<Record<string, number>>({
    base_material: 1,
    layers: 1,
    pcb_quality: 1,
    product_type: 1,
    different_design: 1,
    delivery_format: 1,
    pcb_thickness: 1,
    pcb_color: 1,
    silkscreen: 1,
    outer_copper_weight: 1,
    via_covering: 1,
    min_via_hole_size: 1,
    board_outline_tolerance: 1,
    framework: 1,
    step_stencil: 1,
    nano_coating: 1,
    stencil_side: 1,
    stencil_process_type: 1,
    fiducials: 1,
    package_box: 1,
    stencil_qty: 1,
    thickness_type: 1,
  });
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    base_material: "Fr4,Flex,Aluminum,Copper Core",
    layers: "2,3,4",
    pcb_quality: "6",
    product_type: "aerospace,industrial",
    different_design: "1,2,3,4",
    delivery_format: "Gerber,BOM,DXF",
    pcb_thickness: "0.2mm,0.4mm",
    pcb_color: "green,yellow,red,blue",
    silkscreen: "white,black,yellow",
    outer_copper_weight: "1 oz,2 oz",
    via_covering: "Tented,unTented",
    min_via_hole_size: "0.25mm/(0.35/0.4mm),0.2mm/(0.3/0.35mm)",
    board_outline_tolerance: "+_0.2mm(Regular),+_0.1mm(High Precision)",
    framework: "yes,no",
    step_stencil: "yes,no",
    nano_coating: "yes,no",
    stencil_side: "top only,bottom only,both",
    stencil_process_type: "solder paste stencil,red glue stencil",
    fiducials: "no fiducal,etched through",
    package_box: "with logo,blank",
    stencil_qty: "1,2,5,10",
    thickness_type: "Select by IconCircuit,Select by Custom",
  });

  const [formData, setFormData] = useState<ServiceData>({
    name: "",
    code: "",
    description: "",
    category: "",
    service_type: "",
    base_price: 0,
    status: true,
    config: {},
  });

  const [baseMaterialImages, setBaseMaterialImages] = useState<Record<string, string>>({});

  const MAX_SERVICE_NAME = 100;
  const MAX_SERVICE_CODE = 50;
  const MAX_DESCRIPTION = 500;

  useEffect(() => {
    const initializeForm = () => {
      let initialConfig: ServiceConfig = {};
      const allFields = [...REQUIRED_FIELDS, ...HIGHSPEC_FIELDS, ...STENCIL_FIELDS];

      for (const fieldName of allFields) {
        const input = inputValues[fieldName] || "";
        if (input.trim()) {
          if (fieldName === "pcb_quality") {
            const qualityValue = input.trim();
            (initialConfig as any)[fieldName] = {
              type: "select",
              options: [qualityValue],
              multiplier: {
                [qualityValue]: minMultipliers[fieldName] || 1,
              },
            };
          } else {
            const items = input.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
            const numericOptions: (string | number)[] = [];

            items.forEach((item) => {
              const hasSpecialChars = item.includes(" ") || item.includes("mm") || item.includes("/") || item.includes('"') || item.includes("'") || item.includes("(") || item.includes(")");
              
              if (!hasSpecialChars) {
                const num = parseFloat(item);
                numericOptions.push(isNaN(num) ? item : num);
              } else {
                numericOptions.push(item);
              }
            });

            const newMultipliers: Record<string, number> = {};
            const minMult = minMultipliers[fieldName] || 1;
            const MULTIPLIER = 1.2;

            numericOptions.forEach((opt, index) => {
              const optKey = String(opt);
              if (fieldName === "delivery_format" || fieldName === "pcb_color" || fieldName === "silkscreen") {
                newMultipliers[optKey] = 1;
              } else {
                newMultipliers[optKey] = parseFloat((minMult * Math.pow(MULTIPLIER, index)).toFixed(2));
              }
            });

            (initialConfig as any)[fieldName] = {
              type: "select",
              options: numericOptions,
              multiplier: newMultipliers,
            };
          }
        }
      }

      setFormData((prev) => ({
        ...prev,
        config: initialConfig,
      }));
    };

    initializeForm();
  }, []);

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
    
    if (fieldName === "pcb_quality") {
      if (value.trim()) {
        const numValue = value.trim();
        setFormData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            [fieldName]: {
              type: "select",
              options: [numValue],
              multiplier: {
                [numValue]: minMultipliers[fieldName] || 1,
              },
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            [fieldName]: {
              type: "select",
              options: [],
              multiplier: {},
            },
          },
        }));
      }
    }
  };

  const parseAndSetOptions = (fieldName: string) => {
    const input = inputValues[fieldName];
    if (!input.trim()) {
      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [fieldName]: {
            type: "select",
            options: [],
            multiplier: {},
          },
        },
      }));
      return;
    }

    const items = input.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
    const numericOptions: (string | number)[] = [];

    items.forEach((item) => {
      const hasSpecialChars = item.includes(" ") || item.includes("mm") || item.includes("/") || item.includes('"') || item.includes("'");
      
      if (!hasSpecialChars) {
        const num = parseFloat(item);
        numericOptions.push(isNaN(num) ? item : num);
      } else {
        numericOptions.push(item);
      }
    });

    const newMultipliers: Record<string, number> = {};
    const minMult = minMultipliers[fieldName] || 1;
    const MULTIPLIER = 1.2;

    numericOptions.forEach((opt, index) => {
      const key = String(opt);
      const existingValue = (formData.config as any)[fieldName]?.multiplier?.[key];
      if (existingValue) {
        newMultipliers[key] = existingValue;
      } else if (fieldName === "delivery_format" || fieldName === "pcb_color" || fieldName === "silkscreen") {
        newMultipliers[key] = 1;
      } else {
        newMultipliers[key] = parseFloat((minMult * Math.pow(MULTIPLIER, index)).toFixed(2));
      }
    });

    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [fieldName]: {
          type: "select",
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

  const handleBaseMaterialImageChange = (materialOption: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setBaseMaterialImages((prev) => ({
        ...prev,
        [materialOption]: imageData,
      }));
      
      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          base_material: {
            ...prev.config.base_material,
            images: {
              ...prev.config.base_material?.images,
              [materialOption]: imageData,
            },
          },
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (data: ServiceData): boolean => {
    if (!data.name.trim()) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Service Name is required" });
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let updatedConfig: ServiceConfig = {};
    const allFields = [...REQUIRED_FIELDS, ...HIGHSPEC_FIELDS];

    for (const fieldName of allFields) {
      const input = inputValues[fieldName] || "";
      if (input.trim()) {
        if (fieldName === "pcb_quality") {
          const qualityValue = input.trim();
          (updatedConfig as any)[fieldName] = {
            type: "select",
            options: [qualityValue],
            multiplier: {
              [qualityValue]: minMultipliers[fieldName] || 1,
            },
          };
        } else {
          const items = input.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
          const numericOptions: (string | number)[] = [];

          items.forEach((item) => {
            const hasSpecialChars = item.includes(" ") || item.includes("mm") || item.includes("/") || item.includes('"') || item.includes("'") || item.includes("(") || item.includes(")");
            
            if (!hasSpecialChars) {
              const num = parseFloat(item);
              numericOptions.push(isNaN(num) ? item : num);
            } else {
              numericOptions.push(item);
            }
          });

          const newMultipliers: Record<string, number> = {};
          const minMult = minMultipliers[fieldName] || 1;
          const MULTIPLIER = 1.2;

          numericOptions.forEach((opt, index) => {
            const optKey = String(opt);
            const existingValue = (formData.config as any)[fieldName]?.multiplier?.[optKey];
            if (existingValue) {
              newMultipliers[optKey] = existingValue;
            } else if (fieldName === "delivery_format" || fieldName === "pcb_color" || fieldName === "silkscreen") {
              newMultipliers[optKey] = 1;
            } else {
              newMultipliers[optKey] = parseFloat((minMult * Math.pow(MULTIPLIER, index)).toFixed(2));
            }
          });

          (updatedConfig as any)[fieldName] = {
            type: "select",
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

    return true;
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-body-1xlg font-bold text-dark dark:text-white">
          ADD PCB FABRICATION SERVICE
        </h1>
        <button
          onClick={() => router.push("/management/services")}
          className="inline-flex items-center justify-center rounded-lg bg-gray-300 px-5 py-2 text-sm font-medium text-dark hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <ServiceCards currentService="pcb_fabrication" />

      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={MAX_SERVICE_NAME}
                placeholder="e.g., PCB Fabrication"
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
                placeholder="e.g., PCB_FAB"
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
                placeholder="e.g., 3000"
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
              {REQUIRED_FIELDS.map((fieldName) => (
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
                      {fieldName !== "pcb_quality" && (
                        <button
                          type="button"
                          onClick={() => parseAndSetOptions(fieldName)}
                          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                        >
                          Add Options
                        </button>
                      )}
                    </div>

                    {(formData.config[fieldName as keyof ServiceConfig]?.options || []).length > 0 && (
                      <>
                        {fieldName === "base_material" ? (
                          <div className="grid grid-cols-3 gap-3">
                            {(formData.config[fieldName as keyof ServiceConfig]?.options || []).map((option) => {
                              const multiplier = formData.config[fieldName as keyof ServiceConfig]?.multiplier?.[String(option)] || 1.0;
                              const hasImage = baseMaterialImages[String(option)];
                              return (
                                <div key={option} className="rounded-lg border border-[#E8E8E8] overflow-hidden dark:border-form-strokedark bg-gray-50 dark:bg-gray-800">
                                  <div className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <h4 className="text-sm font-bold text-dark dark:text-white capitalize">
                                          {option}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                          Mult: <span className="font-semibold text-dark dark:text-white">{multiplier}</span>
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeOption(fieldName, option)}
                                        className="ml-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 transition"
                                        title="Delete"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>

                                    {hasImage ? (
                                      <div className="space-y-2">
                                        <div className="bg-white dark:bg-gray-900 rounded p-2 text-center">
                                          <img
                                            src={hasImage}
                                            alt={String(option)}
                                            className="h-20 w-20 mx-auto rounded object-cover border border-[#E8E8E8] dark:border-form-strokedark"
                                          />
                                        </div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                          Change
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              handleBaseMaterialImageChange(String(option), file);
                                            }
                                          }}
                                          className="w-full rounded border border-[#E8E8E8] bg-white dark:bg-form-input px-2 py-1 text-xs text-dark dark:text-white outline-none focus:border-primary dark:border-form-strokedark cursor-pointer"
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="bg-white dark:bg-gray-900 rounded p-3 border-2 border-dashed border-[#E8E8E8] dark:border-form-strokedark text-center">
                                          <svg className="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                          </svg>
                                        </div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                          Upload
                                        </label>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              handleBaseMaterialImageChange(String(option), file);
                                            }
                                          }}
                                          className="w-full rounded border border-[#E8E8E8] bg-white dark:bg-form-input px-2 py-1 text-xs text-dark dark:text-white outline-none focus:border-primary dark:border-form-strokedark cursor-pointer"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
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
                                    {fieldName === "delivery_format" || fieldName === "pcb_color" || fieldName === "silkscreen" || fieldName === "pcb_quality" ? (
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
                                    {fieldName !== "pcb_quality" && (
                                      <button
                                        type="button"
                                        onClick={() => removeOption(fieldName, option)}
                                        className="text-red-500 hover:text-red-600"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-[#E8E8E8] dark:border-dark-3" />

          <div>
            <h3 className="mb-6 text-lg font-bold text-dark dark:text-white">
              High-spec Options
            </h3>

            <div className="space-y-8">
              {HIGHSPEC_FIELDS.map((fieldName) => (
                <div key={fieldName}>
                  <label className="mb-3 block text-md font-bold text-dark dark:text-white">
                    {FIELD_LABELS[fieldName]}
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
            </div>
          </div>

          <hr className="border-[#E8E8E8] dark:border-dark-3" />

          <div>
            <h3 className="mb-6 text-lg font-bold text-dark dark:text-white">
              Stencil Options
            </h3>

            <div className="space-y-8">
              {STENCIL_FIELDS.map((fieldName) => (
                <div key={fieldName}>
                  <label className="mb-3 block text-md font-bold text-dark dark:text-white">
                    {FIELD_LABELS[fieldName]}
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
