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
}

interface ColorSilkscreenMapping {
  type: string;
  mapping: Record<string, string[]>;
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

interface CustomConfig {
  custom_thickness_options?: ConfigOption;
}

interface ThicknessTypeConfig extends ConfigOption {
  custom_config?: CustomConfig;
}

interface ServiceConfig {
  base_material?: ConfigOption;
  layers?: ConfigOption;
  pcb_quality?: ConfigOption;
  pcb_type?: PcbTypeConfig;
  product_type?: ConfigOption;
  different_design?: ConfigOption;
  delivery_format?: ConfigOption;
  pcb_thickness?: ConfigOption;
  pcb_color_silkscreen_map?: ColorSilkscreenMapping;
  outer_copper_weight?: ConfigOption;
  via_covering?: ConfigOption;
  min_via_hole_size?: ConfigOption;
  framework?: ConfigOption;
  step_stencil?: ConfigOption;
  nano_coating?: ConfigOption;
  stencil_side?: ConfigOption;
  stencil_process_type?: ConfigOption;
  fiducials?: ConfigOption;
  package_box?: ConfigOption;
  stencil_qty?: ConfigOption;
  thickness_type?: ThicknessTypeConfig;
  dimension?: DimensionConfig;
  gerber?: { type: string; value: string };
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
  pcb_type: "PCB Type",
  product_type: "Product Type",
  different_design: "Different Design",
  delivery_format: "Delivery Format",
  pcb_thickness: "PCB Thickness",
  material: "Material (Flex)",
  surface_finish: "Surface Finish (Flex)",
  fpc_thickness: "FPC Thickness (Flex)",
  pcb_color_silkscreen_map: "PCB Color to Silkscreen Mapping",
  outer_copper_weight: "Outer Copper Weight",
  via_covering: "Via Covering",
  min_via_hole_size: "Min Via Hole Size/Diameter",
  framework: "Framework",
  step_stencil: "Step Stencil",
  nano_coating: "Nano-Coating",
  stencil_side: "Stencil Side",
  stencil_process_type: "Stencil Process Type",
  fiducials: "Fiducials",
  package_box: "Package Box",
  stencil_qty: "Stencil Qty",
  thickness_type: "Thickness Type",
  custom_thickness_options: "Custom Thickness Options (for Select by Custom)",
  dimension: "PCB Dimension",
  gerber: "Gerber Files",
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  base_material: "e.g., Fr4,Flex,Aluminum,Copper Core",
  layers: "e.g., 2,3,4",
  pcb_quality: "e.g., 6",
  pcb_type: "e.g., Regular,Flex",
  product_type: "e.g., aerospace,industrial",
  different_design: "e.g., 1,2,3,4",
  delivery_format: "e.g., Single Pcb,Panel by Customer",
  pcb_thickness: "e.g., 0.2mm,0.4mm",
  material: "e.g., Polyimide",
  surface_finish: "e.g., Copper,ENIG,Immersion Tin",
  fpc_thickness: "e.g., 0.0024\"/0.06mm,0.0043\"/0.11mm",
  outer_copper_weight: "e.g., 1 oz,2 oz",
  via_covering: "e.g., Tented,unTented",
  min_via_hole_size: "e.g., 0.25mm/(0.35/0.4mm),0.2mm/(0.3/0.35mm)",
  framework: "e.g., yes,no",
  step_stencil: "e.g., yes,no",
  nano_coating: "e.g., yes,no",
  stencil_side: "e.g., top only,bottom only,both",
  stencil_process_type: "e.g., solder paste stencil,red glue stencil",
  fiducials: "e.g., no fiducal,etched through",
  package_box: "e.g., with logo,blank",
  stencil_qty: "e.g., 1",
  thickness_type: "e.g., Select by IconCircuit,Select by Custom",
  custom_thickness_options: "e.g., 0.1mm,0.15mm,0.2mm,0.4mm,0.6mm,0.8mm,1.0mm",
};

const REQUIRED_FIELDS = ["base_material", "layers", "pcb_quality", "product_type", "pcb_type", "different_design", "delivery_format", "pcb_thickness"];
const FLEX_FIELDS = ["material", "surface_finish", "fpc_thickness"];
const HIGHSPEC_FIELDS = ["outer_copper_weight", "via_covering", "min_via_hole_size"];
const STENCIL_FIELDS = ["framework", "step_stencil", "nano_coating", "stencil_side", "stencil_process_type", "fiducials", "package_box", "stencil_qty", "thickness_type", "custom_thickness_options"];

export default function AddPCBFabrication() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    base_material: "Fr4,Flex,Aluminum,Copper Core",
    layers: "2,3,4",
    pcb_quality: "6",
    pcb_type: "Regular,Flex",
    product_type: "aerospace,industrial",
    different_design: "1,2,3,4",
    delivery_format: "Single Pcb,Panel by Customer",
    pcb_thickness: "0.2mm,0.4mm",
    material: "Polyimide",
    surface_finish: "Copper,ENIG,Immersion Tin",
    fpc_thickness: "0.0024\"/0.06mm,0.0043\"/0.11mm",
    outer_copper_weight: "1 oz,2 oz",
    via_covering: "Tented,unTented",
    min_via_hole_size: "0.25mm/(0.35/0.4mm),0.2mm/(0.3/0.35mm)",
    framework: "yes,no",
    step_stencil: "yes,no",
    nano_coating: "yes,no",
    stencil_side: "top only,bottom only,both",
    stencil_process_type: "solder paste stencil,red glue stencil",
    fiducials: "no fiducal,etched through",
    package_box: "with logo,blank",
    stencil_qty: "1",
    thickness_type: "Select by IconCircuit,Select by Custom",
    custom_thickness_options: "0.1mm,0.15mm,0.2mm,0.4mm,0.6mm,0.8mm,1.0mm",
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

  const [dimensionConfig, setDimensionConfig] = useState({
    unit: "mm",
    x_min: "",
    x_max: "",
    y_min: "",
    y_max: "",
  });

  const [colorMappings, setColorMappings] = useState<Array<{ color: string; silkscreen: string }>>([
    { color: "green", silkscreen: "white" },
    { color: "blue", silkscreen: "white" },
    { color: "yellow", silkscreen: "white" },
    { color: "black", silkscreen: "white" },
    { color: "white", silkscreen: "black" },
  ]);
  const [newColorMapping, setNewColorMapping] = useState({ color: "", silkscreen: "" });
  const [gerberFormat, setGerberFormat] = useState("");

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

  const addColorMapping = () => {
    if (newColorMapping.color.trim() && newColorMapping.silkscreen.trim()) {
      setColorMappings((prev) => [...prev, { ...newColorMapping }]);
      setNewColorMapping({ color: "", silkscreen: "" });
    }
  };

  const removeColorMapping = (index: number) => {
    setColorMappings((prev) => prev.filter((_, i) => i !== index));
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
      } else if (fieldName === "thickness_type") {
        setFormData((prev) => ({
          ...prev,
          config: {
            ...prev.config,
            [fieldName]: {
              type: "select",
              options: [],
            } as ThicknessTypeConfig,
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
    } else if (fieldName === "thickness_type") {
      const newConfig: ThicknessTypeConfig = {
        type: "select",
        options: options,
      };

      const currentConfig = formData.config.thickness_type as ThicknessTypeConfig | undefined;
      if (currentConfig?.custom_config) {
        newConfig.custom_config = currentConfig.custom_config;
      }

      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          thickness_type: newConfig,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [fieldName]: {
            type: "select",
            options: options,
          },
        },
      }));
    }
  };

  const removeOption = (fieldName: string, option: string | number, parentField?: string) => {
    setFormData((prev) => {
      if (parentField === "material" || parentField === "surface_finish") {
        const pcbTypeConfig = prev.config.pcb_type as PcbTypeConfig | undefined;
        if (!pcbTypeConfig?.flex_config) return prev;

        const field = parentField as "material" | "surface_finish";
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
      } else if (parentField === "custom_thickness_options") {
        const thicknessTypeConfig = prev.config.thickness_type as ThicknessTypeConfig | undefined;
        if (!thicknessTypeConfig?.custom_config) return prev;

        const currentOptions = thicknessTypeConfig.custom_config.custom_thickness_options?.options || [];
        const newOptions = currentOptions.filter((opt) => String(opt) !== String(option));

        return {
          ...prev,
          config: {
            ...prev.config,
            thickness_type: {
              ...thicknessTypeConfig,
              custom_config: {
                custom_thickness_options: {
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

    const pcbTypeConfig = data.config.pcb_type as PcbTypeConfig | undefined;
    const pcbTypeOptions = pcbTypeConfig?.options || [];
    if (pcbTypeOptions.some(opt => String(opt).toLowerCase() === "flex")) {
      const flexConfig = pcbTypeConfig?.flex_config;
      if (!flexConfig?.material?.options || flexConfig.material.options.length === 0) {
        Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS.material} is required for Flex PCBs` });
        return false;
      }
      if (!flexConfig?.surface_finish?.options || flexConfig.surface_finish.options.length === 0) {
        Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS.surface_finish} is required for Flex PCBs` });
        return false;
      }
      if (!flexConfig?.fpc_thickness?.options || flexConfig.fpc_thickness.options.length === 0) {
        Swal.fire({ icon: "error", title: "Validation Error", text: `${FIELD_LABELS.fpc_thickness} is required for Flex PCBs` });
        return false;
      }
    }

    return true;
  };

  const parseOptions = (input: string): (string | number)[] => {
    const items = input.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
    const options: (string | number)[] = [];

    items.forEach((item) => {
      const hasSpecialChars = item.includes(" ") || item.includes("mm") || item.includes("/") || item.includes('"') || item.includes("'") || item.includes("(") || item.includes(")");
      
      if (!hasSpecialChars) {
        const num = parseFloat(item);
        options.push(isNaN(num) ? item : num);
      } else {
        options.push(item);
      }
    });

    return options;
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

  const parseAndSetCustomThicknessOptions = () => {
    const input = inputValues.custom_thickness_options;
    const options = parseOptions(input);

    setFormData((prev) => {
      const thicknessTypeConfig = (prev.config.thickness_type as ThicknessTypeConfig) || { type: "select", options: [] };
      const customConfig = thicknessTypeConfig.custom_config || {};

      return {
        ...prev,
        config: {
          ...prev.config,
          thickness_type: {
            ...thicknessTypeConfig,
            custom_config: {
              ...customConfig,
              custom_thickness_options: {
                type: "select",
                options: options,
              },
            },
          } as ThicknessTypeConfig,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let updatedConfig: ServiceConfig = {};
    const allFields = [...REQUIRED_FIELDS, ...HIGHSPEC_FIELDS, ...STENCIL_FIELDS];
    
    const isPcbTypeFlex = inputValues.pcb_type?.toLowerCase().includes("flex");

    for (const fieldName of allFields) {
      if (fieldName === "custom_thickness_options") continue;
      
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
            type: "select",
            options: options,
          };
        }
      }
    }

    const isThicknessTypeCustom = inputValues.thickness_type?.toLowerCase().includes("custom");

    if (inputValues.thickness_type?.trim()) {
      const options = parseOptions(inputValues.thickness_type);
      const thicknessTypeConfig: ThicknessTypeConfig = {
        type: "select",
        options: options,
      };

      if (isThicknessTypeCustom && inputValues.custom_thickness_options?.trim()) {
        const customOptions: (string | number)[] = [];
        inputValues.custom_thickness_options.split(",").map((item) => item.trim()).filter((item) => item.length > 0).forEach((item) => {
          const num = parseFloat(item);
          customOptions.push(isNaN(num) ? item : num);
        });

        thicknessTypeConfig.custom_config = {
          custom_thickness_options: {
            type: "select",
            options: customOptions,
          },
        };
      }

      updatedConfig.thickness_type = thicknessTypeConfig;
    }

    if (colorMappings.length > 0) {
      const mapping: Record<string, string[]> = {};
      
      colorMappings.forEach(({ color, silkscreen }) => {
        if (color.trim() && silkscreen.trim()) {
          mapping[color.trim()] = [silkscreen.trim()];
        }
      });

      updatedConfig.pcb_color_silkscreen_map = {
        type: "mapping",
        mapping: mapping,
      };
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
      
      if (gerberFormat.trim()) {
        (finalFormData.config as any).gerber = {
          type: "text",
          value: gerberFormat.trim(),
        };
      }
      
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
          <div className="grid grid-cols-2 gap-6">
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
              {REQUIRED_FIELDS.map((fieldName) => {
                const hasFlex = fieldName === "pcb_type" && inputValues.pcb_type?.toLowerCase().includes("flex");
                
                return (
                  <div key={fieldName} className={hasFlex ? "col-span-2" : ""}>
                    {hasFlex ? (
                      <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
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

                        {FLEX_FIELDS.map((flexField) => {
                          const pcbTypeConfig = formData.config.pcb_type as PcbTypeConfig | undefined;
                          const flexConfig = pcbTypeConfig?.flex_config;
                          const field = flexField as "material" | "surface_finish" | "fpc_thickness";
                          const options = flexConfig?.[field]?.options || [];

                          return (
                            <div key={flexField} className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
                              <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                                {FIELD_LABELS[flexField]} <span className="text-red-500">*</span>
                              </label>

                              <div className="flex flex-col gap-3 flex-1 min-h-0">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={inputValues[flexField]}
                                    onChange={(e) => handleConfigInputChange(flexField, e.target.value)}
                                    placeholder={FIELD_PLACEHOLDERS[flexField] || "Enter options separated by commas"}
                                    className="flex-1 rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => parseAndSetFlexOptions(field)}
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
                                            onClick={() => removeOption(field, option, field)}
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
                    ) : (
                      <div className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
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
                    )}
                  </div>
                );
              })}
            </div>

            <hr className="border-[#E8E8E8] dark:border-dark-3 my-6" />
            <h4 className="mb-4 text-base font-semibold text-dark dark:text-white">
              High Spec Options
            </h4>
            <div className="grid grid-cols-2 gap-6">
              {HIGHSPEC_FIELDS.map((fieldName) => (
                <div key={fieldName} className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
                  <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                    {FIELD_LABELS[fieldName]}
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

            <hr className="border-[#E8E8E8] dark:border-dark-3 my-6" />
            <h4 className="mb-4 text-base font-semibold text-dark dark:text-white">
              Stencil Options
            </h4>
            <div className="grid grid-cols-2 gap-6">
              {STENCIL_FIELDS.filter(f => f !== "custom_thickness_options").map((fieldName) => (
                <div key={fieldName} className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
                  <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                    {FIELD_LABELS[fieldName]}
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

              {inputValues.thickness_type?.toLowerCase().includes("custom") && (
                <div key="custom_thickness_options" className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
                  <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                    {FIELD_LABELS.custom_thickness_options}
                  </label>

                  <div className="flex flex-col gap-3 flex-1 min-h-0">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputValues.custom_thickness_options}
                        onChange={(e) => handleConfigInputChange("custom_thickness_options", e.target.value)}
                        placeholder={FIELD_PLACEHOLDERS.custom_thickness_options || "Enter options separated by commas"}
                        className="flex-1 rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => parseAndSetCustomThicknessOptions()}
                        className="rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition-colors whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>

                    <div className="thin-primary-scrollbar flex-1 rounded border border-[#E8E8E8] dark:border-form-strokedark bg-gray-50 dark:bg-gray-700">
                      {(() => {
                        const thicknessTypeConfig = formData.config.thickness_type as ThicknessTypeConfig | undefined;
                        const customOptions = thicknessTypeConfig?.custom_config?.custom_thickness_options?.options || [];
                        return customOptions.length > 0 ? (
                          <div>
                            {customOptions.map((option, idx) => (
                              <div key={option} className={`flex items-center justify-between px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm ${idx !== customOptions.length - 1 ? 'border-b border-[#E8E8E8] dark:border-form-strokedark' : ''}`}>
                                <span className="font-medium text-dark dark:text-white truncate flex-1">
                                  {option}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeOption("custom_thickness_options", option, "custom_thickness_options")}
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
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-[#E8E8E8] dark:border-dark-3 my-6" />
            <h4 className="mb-4 text-base font-semibold text-dark dark:text-white">
              {FIELD_LABELS.pcb_color_silkscreen_map}
            </h4>
            <div className="rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4 mb-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">PCB Color</label>
                  <input
                    type="text"
                    value={newColorMapping.color}
                    onChange={(e) => setNewColorMapping((prev) => ({ ...prev, color: e.target.value }))}
                    placeholder="e.g., green, blue"
                    className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Silkscreen</label>
                  <input
                    type="text"
                    value={newColorMapping.silkscreen}
                    onChange={(e) => setNewColorMapping((prev) => ({ ...prev, silkscreen: e.target.value }))}
                    placeholder="e.g., white, black"
                    className="w-full rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addColorMapping}
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition-colors"
              >
                Add Mapping
              </button>

              <div className="mt-6">
                <h5 className="mb-3 text-sm font-semibold text-dark dark:text-white">Current Mappings</h5>
                {colorMappings.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {colorMappings.map((mapping, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border border-[#E8E8E8] dark:border-form-strokedark">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-dark dark:text-white">{mapping.color}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium text-dark dark:text-white">{mapping.silkscreen}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColorMapping(idx)}
                          className="inline-flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                          title="Delete mapping"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    No mappings added yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-[#E8E8E8] dark:border-dark-3 my-6" />

          <div>
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

          <hr className="border-[#E8E8E8] dark:border-dark-3 my-6" />
          <h4 className="mb-4 text-base font-semibold text-dark dark:text-white">
            {FIELD_LABELS.gerber}
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col h-80 rounded-lg border border-[#E8E8E8] dark:border-form-strokedark bg-white dark:bg-gray-dark p-4">
              <label className="mb-3 block text-base font-semibold text-dark dark:text-white">
                {FIELD_LABELS.gerber}
              </label>

              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gerberFormat}
                    onChange={(e) => setGerberFormat(e.target.value)}
                    placeholder="e.g., RAR,ZIP,Gerber"
                    className="flex-1 rounded border border-[#E8E8E8] bg-transparent px-3 py-2 text-sm text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div className="thin-primary-scrollbar flex-1 rounded border border-[#E8E8E8] dark:border-form-strokedark bg-gray-50 dark:bg-gray-700">
                  {gerberFormat.trim() ? (
                    <div className="px-3 py-2.5 text-sm font-medium text-dark dark:text-white">
                      {gerberFormat}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                      Enter gerber formats
                    </div>
                  )}
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
