"use client";

import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api-client";

export interface AnalyticsData {
  activeUsers: { value: number; growthRate: number };
  totalOrders: { value: number; growthRate: number };
  totalContacts: { value: number; growthRate: number };
  totalNewsletter: { value: number; growthRate: number };
  ordersChart: { name: string; amount: number }[];
  ordersData?: { completed: number; pending: number };
  ordersByPeriod?: {
    daily: Array<{ date: string; completed: number }>;
    weekly: Array<{ day: string; date: string; completed: number }>;
    monthly: Array<{ month: string; monthNumber: number; completed: number }>;
    yearly: Array<{ year: number; completed: number }>;
  };
  paymentsByPeriod?: {
    daily: Array<{ date: string; total: number; count: number }>;
    weekly: Array<{ _id: string; total: number; count: number; day?: string }>;
    monthly: Array<{ month: string; monthNumber: number; total: number; count: number }>;
    yearly: Array<{ _id: number; total: number; count: number; year?: number }>;
  };
  users?: {
    total: number;
    active: number;
    inactive: number;
  };
}

let cachedAnalytics: AnalyticsData | null = null;
let cachePromise: Promise<AnalyticsData> | null = null;

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(cachedAnalytics);
  const [loading, setLoading] = useState(!cachedAnalytics);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (cachedAnalytics) {
        setData(cachedAnalytics);
        setLoading(false);
        return;
      }

      if (cachePromise) {
        const result = await cachePromise;
        setData(result);
        setLoading(false);
        return;
      }

      cachePromise = (async () => {
        try {
          setLoading(true);
          const response = await apiCall<any>(
            "/api/admin/dashboard/analytics",
            {},
            true
          ) as any;

          if (response?.data) {
            const { users, orders, contacts, newsletter, payments } = response.data;
            const analyticsData: AnalyticsData = {
              activeUsers: { value: users?.active || 0, growthRate: 0 },
              totalOrders: { value: orders?.summary?.total || 0, growthRate: 0 },
              totalContacts: { value: contacts?.total || 0, growthRate: 0 },
              totalNewsletter: { value: newsletter?.total || 0, growthRate: 0 },
              ordersChart: [
                { name: "Completed", amount: orders?.summary?.completed || 0 },
                { name: "Confirmed", amount: orders?.summary?.confirmed || 0 },
                { name: "Cancelled", amount: orders?.summary?.cancelled || 0 },
              ],
              ordersData: { completed: orders?.summary?.completed || 0, pending: orders?.summary?.pending || 0 },
              ordersByPeriod: orders?.daily || orders?.weekly || orders?.monthly || orders?.yearly
                ? {
                    daily: orders?.daily || [],
                    weekly: orders?.weekly || [],
                    monthly: orders?.monthly || [],
                    yearly: orders?.yearly || [],
                  }
                : undefined,
              paymentsByPeriod: payments?.daily || payments?.weekly || payments?.monthly || payments?.yearly
                ? {
                    daily: payments?.daily || [],
                    weekly: payments?.weekly || [],
                    monthly: payments?.monthly || [],
                    yearly: payments?.yearly || [],
                  }
                : undefined,
              users: users
                ? {
                    total: users.total || 0,
                    active: users.active || 0,
                    inactive: users.inactive || 0,
                  }
                : undefined,
            };
            cachedAnalytics = analyticsData;
            setData(analyticsData);
            return analyticsData;
          }
          return cachedAnalytics || ({} as AnalyticsData);
        } catch (error) {
          console.error("Failed to fetch analytics:", error);
          return cachedAnalytics || ({} as AnalyticsData);
        } finally {
          setLoading(false);
          cachePromise = null;
        }
      })();

      const result = await cachePromise;
      setData(result);
    };

    fetchAnalytics();
  }, []);

  return { data, loading };
}
