"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import Swal from "sweetalert2";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NewsletterSubscriber {
  _id: string;
  email: string;
  createdAt: string;
}

interface NewsletterApiResponse {
  success: boolean;
  data: NewsletterSubscriber[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ManageNewsletter() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await apiCall<any>(
        `/api/admin/newsletter?page=${currentPage}&limit=10`
      );

      if (Array.isArray(response)) {
        setSubscribers(response);
        setTotalPages(1);
      } else if (response && response.data) {
        setSubscribers(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setSubscribers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subscriberId: string, email: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${email}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await apiCall(`/api/admin/newsletter/${subscriberId}`, {
          method: "DELETE",
        });

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Subscriber has been successfully deleted.",
          confirmButtonText: "OK",
        });

        fetchSubscribers();
      } catch (error) {
        console.error("Failed to delete subscriber:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Failed to delete subscriber",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="mb-4 text-body-1xlg font-bold text-dark dark:text-white">
            NEWSLETTER SUBSCRIBERS
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 uppercase [&>th]:py-4 [&>th]:px-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white [&>th]:text-left">
              <TableHead className="w-1/5">
                SI.NO
              </TableHead>
              <TableHead className="w-2/5">
                Email
              </TableHead>
              <TableHead className="w-2/5">Subscribed Date</TableHead>
              <TableHead className="w-2/5 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-dark dark:text-white">
                  Loading...
                </TableCell>
              </TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-dark dark:text-white">
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((subscriber, index) => (
                <TableRow
                  key={subscriber._id}
                  className="border-[#eee] text-base font-normal text-dark dark:border-dark-3 dark:text-white [&>td]:py-5 [&>td]:px-4 [&>td]:text-left"
                >
                  <TableCell className="w-1/5">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {(currentPage - 1) * 10 + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="w-2/5">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {subscriber.email}
                    </p>
                  </TableCell>
                  <TableCell className="w-2/5">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {formatDate(subscriber.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="w-2/5 text-center">
                    <button
                      onClick={() => handleDelete(subscriber._id, subscriber.email)}
                      className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-500 dark:hover:bg-red-900/20 transition"
                      title="Delete subscriber"
                    >
                      <TrashIcon width={18} height={18} />
                    </button>
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
