"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import Swal from "sweetalert2";
import { EyeIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  _id: string;
  orderId: string;
  userEmail: string;
  amount: number;
  serviceName: string;
  serviceCode: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  userDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface OrdersApiResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    pagination?: {
      currentPage?: number;
      pageSize?: number;
      totalItems?: number;
      totalPages?: number;
    };
  };
}

export default function ManageOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiCall<any>(
        `/api/admin/orders?page=${currentPage}&limit=${itemsPerPage}`,
        {},
        true
      ) as any;

      if (response?.data?.orders && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
        const total = response.data.pagination?.totalItems || response.data.orders.length;
        setTotalOrders(total);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
        return "bg-[#219653]/[0.08] text-[#219653]";
      case "pending":
        return "bg-[#FFA500]/[0.08] text-[#FFA500]";
      case "cancelled":
        return "bg-[#DC3545]/[0.08] text-[#DC3545]";
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



  return (
    <>
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-4 text-body-1xlg font-bold text-dark dark:text-white">
              ORDERS LIST
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Orders: {totalOrders} | Current Page: {currentPage} | Orders on this page: {orders.length}
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 uppercase [&>th]:py-4 [&>th]:text-sm [&>th]:text-dark [&>th]:dark:text-white [&>th]:text-center">
              <TableHead className="min-w-[80px] !text-left xl:pl-7.5">
                SI.NO
              </TableHead>
              <TableHead className="min-w-[160px]">Customer Name</TableHead>
              <TableHead className="min-w-[150px]">Service</TableHead>
              <TableHead className="min-w-[120px]">Amount</TableHead>
              <TableHead className="min-w-[120px]">Order Status</TableHead>
              <TableHead className="min-w-[120px]">Payment Status</TableHead>
              <TableHead className="min-w-[100px]">Date</TableHead>
              <TableHead className="!text-right xl:pr-7.5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-dark dark:text-white">
                  Loading...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-dark dark:text-white">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order, index) => (
                <TableRow
                  key={order._id}
                  className="border-[#eee] text-center text-base font-normal text-dark dark:border-dark-3 dark:text-white"
                >
                  <TableCell className="min-w-[80px] !text-left xl:pl-7.5">
                    <p className="py-4 text-base font-normal text-dark dark:text-white">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </p>
                  </TableCell>
               
                  <TableCell className="min-w-[160px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {order.userDetails?.name || "N/A"}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {order.serviceName}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {formatCurrency(order.amount)}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <span
                      className={`inline-flex rounded-full px-3.5 py-1 text-base font-normal ${getStatusBadgeColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.charAt(0).toUpperCase() +
                        order.orderStatus.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <span
                      className={`inline-flex rounded-full px-3.5 py-1 text-base font-normal ${getStatusBadgeColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {formatDate(order.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="!text-right xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-4">
                      <button
                        onClick={() =>
                          router.push(`/management/orders/${order.orderId}`)
                        }
                        className="inline-flex items-center justify-center text-primary hover:text-opacity-80"
                        title="View order"
                      >
                        <EyeIcon />
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
                Showing <strong>{orders.length}</strong> orders | Total: <strong>{totalOrders}</strong> orders
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
