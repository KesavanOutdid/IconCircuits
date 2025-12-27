"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import Swal from "sweetalert2";
import { EyeIcon, PencilSquareIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Quotation {
  _id: string;
  quotation_id: string;
  service_name: string;
  service_code: string;
  user_id: string;
  pcb_name: string;
  status: string;
  quoted_amount: number;
  createdAt: string;
  userDetails?: {
    name: string;
    email: string;
  };
}

interface QuotationsApiResponse {
  success: boolean;
  message: string;
  data: {
    quotations: Quotation[];
    pagination?: {
      currentPage?: number;
      pageSize?: number;
      totalItems?: number;
      totalPages?: number;
    };
  };
}

export default function ManageQuotations() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotations, setTotalQuotations] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuotations();
  }, [currentPage]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await apiCall<any>(
        `/api/admin/quotations?page=${currentPage}&limit=${itemsPerPage}`,
        {},
        true
      ) as any;

      if (response?.data?.quotations && Array.isArray(response.data.quotations)) {
        setQuotations(response.data.quotations);
        const total = response.data.pagination?.totalItems || response.data.quotations.length;
        setTotalQuotations(total);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setQuotations([]);
        setTotalQuotations(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setQuotations([]);
      setTotalQuotations(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const handleEditQuotation = async (quotation: Quotation) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Quotation",
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 10px;">
          <div>
            <label style="display: block; font-size: 15px; font-weight: 600; margin-bottom: 6px; color: #333;">
              Action
            </label>
            <select id="action" style="width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; font-family: inherit; background-color: #fff; color: #333;">
              <option value="quote">Quote</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 15px; font-weight: 600; margin-bottom: 6px; color: #333;">
              Quoted Amount (₹)
            </label>
            <input id="quotedAmount" type="number" placeholder="Enter quoted amount" style="width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; font-family: inherit; box-sizing: border-box;"/>
          </div>
          <div>
            <label style="display: block; font-size: 15px; font-weight: 600; margin-bottom: 6px; color: #333;">
              Reason
            </label>
            <textarea id="reason" placeholder="Enter reason" style="width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; font-family: inherit; min-height: 70px; box-sizing: border-box; resize: vertical;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: "#3B82F6",
      cancelButtonColor: "#6B7280",
      width: "400px",
      didOpen: () => {
        const actionSelect = document.getElementById("action") as HTMLSelectElement;
        const quotedAmountInput = document.getElementById("quotedAmount") as HTMLInputElement;
        const titleElement = document.querySelector(".swal2-title") as HTMLElement;
        
        if (titleElement) {
          titleElement.style.fontSize = "22px";
        }
        
        const confirmBtn = document.querySelector(".swal2-confirm") as HTMLElement;
        const cancelBtn = document.querySelector(".swal2-cancel") as HTMLElement;
        
        if (confirmBtn) {
          confirmBtn.style.padding = "6px 16px";
          confirmBtn.style.fontSize = "13px";
        }
        
        if (cancelBtn) {
          cancelBtn.style.padding = "6px 16px";
          cancelBtn.style.fontSize = "13px";
        }
        
        actionSelect.value = "quote";
        quotedAmountInput.value = quotation.quoted_amount?.toString() || "";
      },
      preConfirm: () => {
        const action = (document.getElementById("action") as HTMLSelectElement).value;
        const quotedAmount = (document.getElementById("quotedAmount") as HTMLInputElement).value;
        const reason = (document.getElementById("reason") as HTMLTextAreaElement).value;

        if (!action || !quotedAmount || !reason) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }

        return { action, quotedAmount: parseFloat(quotedAmount), reason };
      },
    });

    if (formValues) {
      try {
        await apiCall(
          `/api/admin/quotations/${quotation.quotation_id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              action: formValues.action,
              quoted_amount: formValues.quotedAmount,
              reason: formValues.reason,
            }),
          },
          false
        );

        Swal.fire({
          icon: "success",
          title: "Quotation Updated",
          text: "Quotation has been updated successfully",
        });

        fetchQuotations();
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to update quotation";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    }
  };

  return (
    <>
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-4 text-body-1xlg font-bold text-dark dark:text-white">
              QUOTATIONS LIST
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Quotations: {totalQuotations} | Current Page: {currentPage} | Quotations on this page: {quotations.length}
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 uppercase [&>th]:py-4 [&>th]:text-sm [&>th]:text-dark [&>th]:dark:text-white [&>th]:text-center">
              <TableHead className="min-w-[80px] !text-left xl:pl-7.5">
                SI.NO
              </TableHead>
              <TableHead className="min-w-[150px]">PCB Name</TableHead>
              <TableHead className="min-w-[140px]">Customer Name</TableHead>
              <TableHead className="min-w-[160px]">Service</TableHead>
              <TableHead className="min-w-[120px]">Amount</TableHead>
              <TableHead className="min-w-[130px]">Status</TableHead>
              <TableHead className="min-w-[100px]">Date</TableHead>
              <TableHead className="!text-right xl:pr-7.5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-dark dark:text-white">
                  Loading...
                </TableCell>
              </TableRow>
            ) : quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-dark dark:text-white">
                  No quotations found
                </TableCell>
              </TableRow>
            ) : (
              quotations.map((quotation, index) => (
                <TableRow
                  key={quotation._id}
                  className="border-[#eee] text-center text-base font-normal text-dark dark:border-dark-3 dark:text-white"
                >
                  <TableCell className="min-w-[80px] !text-left xl:pl-7.5">
                    <p className="py-4 text-base font-normal text-dark dark:text-white">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {quotation.pcb_name || "N/A"}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {quotation.userDetails?.name || quotation.user_id || "N/A"}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {quotation.service_name}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {quotation.quoted_amount ? formatCurrency(quotation.quoted_amount) : "N/A"}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[130px]">
                    <span
                      className={`inline-flex rounded-full px-3.5 py-1 text-base font-normal ${getStatusBadgeColor(
                        quotation.status
                      )}`}
                    >
                      {quotation.status.charAt(0).toUpperCase() +
                        quotation.status.slice(1).replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {formatDate(quotation.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="!text-right xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-4">
                      <button
                        onClick={() =>
                          router.push(`/management/quotations/${quotation.quotation_id}`)
                        }
                        className="inline-flex items-center justify-center text-primary hover:text-opacity-80"
                        title="View quotation"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => handleEditQuotation(quotation)}
                        className="inline-flex items-center justify-center text-primary hover:text-opacity-80"
                        title="Edit quotation"
                      >
                        <PencilSquareIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-8 border-t border-[#E8E8E8] pt-6 dark:border-dark-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <strong>{quotations.length}</strong> quotations | Total: <strong>{totalQuotations}</strong> quotations
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed dark:border-primary dark:text-primary"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "border border-[#E8E8E8] text-dark hover:border-primary dark:border-dark-3 dark:text-white dark:hover:border-primary"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed dark:border-primary dark:text-primary"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
