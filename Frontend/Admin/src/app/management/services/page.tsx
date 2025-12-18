"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api-client";
import Swal from "sweetalert2";
import { TrashIcon, EyeIcon, PencilSquareIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Service {
  _id: string;
  service_id: number;
  name: string;
  base_price_inr: number;
  status: boolean;
  code: string;
  type: string;
  min_order_qty: number;
}

interface ServicesApiResponse {
  success: boolean;
  data: Service[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export default function ManageServices() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState<ServicesApiResponse["pagination"] | null>(null);

  useEffect(() => {
    fetchServices();
  }, [currentPage]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiCall<any>(
        `/api/admin/services?page=${currentPage}&limit=5`
      );
      
      if (Array.isArray(response)) {
        setServices(response);
        setTotalPages(1);
      } else if (response && response.data) {
        setServices(Array.isArray(response.data) ? response.data : []);
        setPagination(response.pagination);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setServices([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string, serviceName: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${serviceName}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await apiCall(`/api/admin/services/${serviceId}`, {
          method: "DELETE",
        });

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Service has been successfully deleted.",
          confirmButtonText: "OK",
        });

        fetchServices();
      } catch (error) {
        console.error("Failed to delete service:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Failed to delete service",
        });
      }
    }
  };
  return (
    <>
     

      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="mb-4 text-body-1xlg font-bold text-dark dark:text-white">
            SERVICES LIST
          </h2>
          <button
            onClick={() => router.push("/management/services/add/pcb-layout")}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
          >
            Add New Service
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 uppercase [&>th]:py-4 [&>th]:text-sm [&>th]:text-dark [&>th]:dark:text-white [&>th]:text-center">
              <TableHead className="min-w-[80px] !text-left xl:pl-7.5">
                SI.NO
              </TableHead>
              <TableHead className="min-w-[155px]">Name</TableHead>
              <TableHead>Service Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="!text-right xl:pr-7.5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-dark dark:text-white">
                  Loading...
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-dark dark:text-white">
                  No services found
                </TableCell>
              </TableRow>
            ) : (
              services.map((service, index) => (
                <TableRow
                  key={service._id}
                  className="border-[#eee] text-center text-base font-normal text-dark dark:border-dark-3 dark:text-white"
                >
                  <TableCell className="min-w-[80px] !text-left xl:pl-7.5">
                    <p className="py-4 text-base font-normal text-dark dark:text-white">
                      {(currentPage - 1) * 5 + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[155px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {service.name}
                    </p>
                  </TableCell>
                 
                  <TableCell>
                    <p className="text-base font-normal text-dark dark:text-white">{service.code}</p>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-3.5 py-1 text-base font-normal ${
                        service.status
                          ? "bg-[#219653]/[0.08] text-[#219653]"
                          : "bg-[#DC3545]/[0.08] text-[#DC3545]"
                      }`}
                    >
                      {service.status ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="!text-right xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-4">
                      <button
                        onClick={() => router.push(`/management/services/${service.service_id}`)}
                        className="inline-flex items-center justify-center text-primary hover:text-opacity-80"
                        title="View service"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => router.push(`/management/services/${service.service_id}/edit`)}
                        className="inline-flex items-center justify-center text-primary hover:text-opacity-80"
                        title="Edit service"
                      >
                        <PencilSquareIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(service.service_id, service.name)}
                        className="inline-flex items-center justify-center text-red-500 hover:text-red-600"
                        title="Delete service"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
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
        )}
      </div>
    </>
  );
}
