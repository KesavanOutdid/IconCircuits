"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api-client";

interface OrderDetail {
  _id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userProfile?: {
    name: string;
    email: string;
    phone: string;
  };
  cartItems: Array<{
    _id: string;
    cart_id: string;
    pcb_name: string;
    config: Record<string, any>;
    order_value: number;
    tax: number;
    total_price: number;
  }>;
  shippingAddress?: {
    _id: string;
    street: string;
    city: string;
    district: string;
    state: string;
    country: string;
    pincode: string;
    companyName: string;
    gstNo: string;
    location?: string;
    type: string[];
  };
  cartSummary: {
    totalItems: number;
    totalValue: number;
  };
  paymentType: string;
  paymentStatus: string;
  orderStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
  userDetails?: any;
}

export default function ViewOrder() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) {
      setError("Invalid order ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiCall<any>(
        `/api/admin/orders/${orderId}`
      );

      console.log("Order Detail Response:", response);
      
      if (response?.data) {
        setOrder(response.data);
      } else if (response) {
        setOrder(response);
      } else {
        setError("Failed to load order details");
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError("Failed to load order details. Invalid order ID.");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark dark:text-white">Loading...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error || "Order not found"}</p>
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
          ORDER DETAILS
        </h1>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-lg bg-gray-300 px-5 py-2 text-sm font-medium text-dark hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Order Summary */}
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            Order Information
          </h2>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Order ID
              </label>
              <p className="mt-2 text-sm text-dark dark:text-white">
                {order.orderId}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Order Status
              </label>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3.5 py-1 text-sm font-normal ${getStatusBadgeColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus.charAt(0).toUpperCase() +
                    order.orderStatus.slice(1)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Payment Status
              </label>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3.5 py-1 text-sm font-normal ${getStatusBadgeColor(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Payment Type
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {order.paymentType.charAt(0).toUpperCase() +
                  order.paymentType.slice(1)}
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
                {order.userProfile?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Email
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {order.userEmail}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Phone
              </label>
              <p className="mt-2 text-dark dark:text-white">
                {order.userProfile?.phone || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                User ID
              </label>
              <p className="mt-2 text-sm text-dark dark:text-white">
                {order.userId}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Shipping Address
            </h2>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Company Name
                </label>
                <p className="mt-2 text-dark dark:text-white">
                  {order.shippingAddress.companyName}
                </p>
              </div>
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Street
                </label>
                <p className="mt-2 text-dark dark:text-white">
                  {order.shippingAddress.street}
                </p>
              </div>
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  City
                </label>
                <p className="mt-2 text-dark dark:text-white">
                  {order.shippingAddress.city}
                </p>
              </div>
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  District
                </label>
                <p className="mt-2 text-dark dark:text-white">
                  {order.shippingAddress.district}
                </p>
              </div>
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  State
                </label>
                <p className="mt-2 text-dark dark:text-white">
                  {order.shippingAddress.state}
                </p>
              </div>
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Country
                </label>
                <p className="mt-2 text-dark dark:text-white">
                  {order.shippingAddress.country}
                </p>
              </div>
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Pincode
                </label>
                <p className="mt-2 text-dark dark:text-white">
                  {order.shippingAddress.pincode}
                </p>
              </div>
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  GST No
                </label>
                <p className="mt-2 text-dark dark:text-white">
                  {order.shippingAddress.gstNo}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            Cart Items ({order.cartSummary.totalItems})
          </h2>
          <div className="space-y-4">
            {order.cartItems.map((item, idx) => (
              <div
                key={item._id}
                className="rounded border border-[#E8E8E8] p-4 dark:border-dark-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-dark dark:text-white">
                    {idx + 1}. {item.pcb_name}
                  </h3>
                </div>
                <div className="mb-3 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Items
                    </p>
                    <p className="mt-1 text-lg font-semibold text-dark dark:text-white">
                      {order.cartSummary.totalItems}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Order Value
                    </p>
                    <p className="mt-1 text-lg font-semibold text-dark dark:text-white">
                      {formatCurrency(item.order_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tax
                    </p>
                    <p className="mt-1 text-lg font-semibold text-dark dark:text-white">
                      {formatCurrency(item.tax)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Price
                    </p>
                    <p className="mt-1 text-lg font-semibold text-dark dark:text-white">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-dark dark:text-white">
                    Configuration:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(item.config).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded bg-gray-100 p-2 dark:bg-gray-700"
                      >
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 text-sm text-dark dark:text-white">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        {/* <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            Order Summary
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="mt-2 text-2xl font-bold text-dark dark:text-white">
                {formatCurrency(order.cartSummary.totalValue)}
              </p>
            </div>
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment Method
              </p>
              <p className="mt-2 text-2xl font-bold text-dark dark:text-white capitalize">
                {order.paymentType}
              </p>
            </div>
          </div>
        </div> */}

        {/* Payment Details */}
        {order.razorpayOrderId && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Payment Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Razorpay Order ID
                </label>
                <p className="mt-2 text-sm text-dark dark:text-white">
                  {order.razorpayOrderId}
                </p>
              </div>
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Razorpay Payment ID
                </label>
                <p className="mt-2 text-sm text-dark dark:text-white">
                  {order.razorpayPaymentId || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            Timestamps
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Created At
              </label>
              <p className="mt-2 text-sm text-dark dark:text-white">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Updated At
              </label>
              <p className="mt-2 text-sm text-dark dark:text-white">
                {formatDate(order.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
