"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api-client";

interface QuotationDetail {
  _id: string;
  quotation_id: string;
  user_id: string;
  userId: string;
  service_id: string;
  service_name: string;
  service_code: string;
  pcb_name: string;
  config: Record<string, any>;
  description: string;
  status: string;
  quoted_amount: number;
  admin_reason?: string;
  user_reason?: string;
  files?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    uploadedAt: string;
  }>;
  history?: Array<{
    action: string;
    reason: string;
    status: string;
    updatedBy: string;
    updatedAt: string;
    quoted_amount?: number;
  }>;
  createdAt: string;
  updatedAt: string;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    };
  };
}

export default function ViewQuotation() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params?.id as string;

  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quotationId) {
      fetchQuotationDetail();
    }
  }, [quotationId]);

  const fetchQuotationDetail = async () => {
    if (!quotationId) {
      setError("Invalid quotation ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiCall<any>(
        `/api/admin/quotations/${quotationId}`
      );

      console.log("Quotation Detail Response:", response);
      
      if (response?.data) {
        setQuotation(response.data);
      } else if (response) {
        setQuotation(response);
      } else {
        setError("Failed to load quotation details");
      }
    } catch (err) {
      console.error("Failed to fetch quotation details:", err);
      setError("Failed to load quotation details. Invalid quotation ID.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN");
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "quoted":
        return "bg-[#219653]/[0.08] text-[#219653]";
      case "pending":
        return "bg-[#FFA500]/[0.08] text-[#FFA500]";
      case "rejected":
        return "bg-[#DC3545]/[0.08] text-[#DC3545]";
      case "requote_requested":
        return "bg-[#3B82F6]/[0.08] text-[#3B82F6]";
      default:
        return "bg-[#6B7280]/[0.08] text-[#6B7280]";
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.includes("pdf")) return "📄";
    if (mimetype.includes("image")) return "🖼️";
    if (mimetype.includes("word")) return "📝";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark dark:text-white">Loading...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error || "Quotation not found"}</p>
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
          QUOTATION DETAILS
        </h1>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-lg bg-gray-300 px-5 py-2 text-sm font-medium text-dark hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Quotation Summary */}
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            Quotation Information
          </h2>
          <div className="grid grid-cols-4 gap-6">
         
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Status
              </label>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3.5 py-1 text-sm font-normal ${getStatusBadgeColor(
                    quotation.status
                  )}`}
                >
                  {quotation.status.charAt(0).toUpperCase() +
                    quotation.status.slice(1).replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Quoted Amount
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {quotation.quoted_amount ? formatCurrency(quotation.quoted_amount) : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Created Date
              </label>
              <p className="mt-2 text-sm text-dark dark:text-white">
                {formatDate(quotation.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            Service Information
          </h2>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Service Name
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {quotation.service_name}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Service Code
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {quotation.service_code}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                PCB Name
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {quotation.pcb_name}
              </p>
            </div>
        
          </div>
        </div>

        {/* Customer Information */}
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            Customer Information
          </h2>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Customer Name
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {quotation.userDetails?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Email
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {quotation.userDetails?.email || quotation.user_id}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Phone
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {quotation.userDetails?.phone || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                User ID
              </label>
          
            </div>
          </div>
        </div>

        {/* Configuration */}
        {quotation.config && Object.keys(quotation.config).length > 0 && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Configuration Details
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(quotation.config).map(([key, value]) => (
                <div key={key} className="rounded bg-gray-100 px-3 py-2 dark:bg-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm text-dark dark:text-white">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {quotation.description && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Description
            </h2>
            <p className="text-dark dark:text-white whitespace-pre-wrap">
              {quotation.description}
            </p>
          </div>
        )}

        {/* Reasons */}
        <div className="grid grid-cols-2 gap-6">
          {quotation.admin_reason && (
            <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
              <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
                Admin Reason
              </h2>
              <p className="text-dark dark:text-white">
                {quotation.admin_reason}
              </p>
            </div>
          )}
          {quotation.user_reason && (
            <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
              <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
                User Reason
              </h2>
              <p className="text-dark dark:text-white">
                {quotation.user_reason}
              </p>
            </div>
          )}
        </div>

        {/* Files */}
        {quotation.files && quotation.files.length > 0 && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Attached Files ({quotation.files.length})
            </h2>
            <div className="space-y-3">
              {quotation.files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded border border-[#E8E8E8] p-4 dark:border-dark-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                    <div>
                      <p className="text-sm font-medium text-dark dark:text-white">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(file.uploadedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {quotation.history && quotation.history.length > 0 && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Quotation History
            </h2>
            <div className="space-y-4">
              {quotation.history.map((entry, idx) => (
                <div
                  key={idx}
                  className="rounded border border-[#E8E8E8] p-4 dark:border-dark-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-dark dark:text-white">
                        {entry.action.charAt(0).toUpperCase() +
                          entry.action.slice(1).replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        By: {entry.updatedBy} | {formatDate(entry.updatedAt)}
                      </p>
                    </div>
                    {entry.quoted_amount && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Amount
                        </p>
                        <p className="text-base font-bold text-dark dark:text-white">
                          {formatCurrency(entry.quoted_amount)}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-dark dark:text-white">
                    {entry.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
