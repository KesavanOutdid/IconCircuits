"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api-client";

interface Address {
  type: string[];
  street: string;
  city: string;
  location: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  companyName: string;
  gstNo: string;
}

interface UserDetail {
  _id: string;
  userId: number;
  name: string;
  email: string;
  roleId: number;
  phone: string;
  status: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdTime?: string;
  modifiedBy?: string;
  modifiedTime?: string;
}

export default function ViewUser() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const fetchUserDetail = async () => {
    if (!userId) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiCall<UserDetail>(`/api/admin/users/${userId}`);
      console.log("User data received:", data);
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setError("Failed to load user details. Invalid user ID or user not found.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark dark:text-white">Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error || "User not found"}</p>
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
          USER DETAILS
        </h1>
        <div className="flex gap-3">
         
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-lg bg-gray-300 px-5 py-2 text-sm font-medium text-dark hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            User Information
          </h2>

          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Full Name
              </label>
              <p className="mt-2 text-base text-dark dark:text-white">
                {user.name}
              </p>
            </div>

            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Email
              </label>
              <p className="mt-2 text-base text-dark dark:text-white">
                {user.email}
              </p>
            </div>

            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Phone
              </label>
              <p className="mt-2 text-base text-dark dark:text-white">
                {user.phone || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Role ID
              </label>
              <p className="mt-2 text-base text-dark dark:text-white">
                {user.roleId}
              </p>
            </div>

            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Status
              </label>
              <p className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3.5 py-1 text-base font-normal ${
                    user.status
                      ? "bg-[#219653]/[0.08] text-[#219653]"
                      : "bg-[#DC3545]/[0.08] text-[#DC3545]"
                  }`}
                >
                  {user.status ? "Active" : "Inactive"}
                </span>
              </p>
            </div>

            <div>
              <label className="text-base font-semibold text-dark dark:text-white">
                Created Date
              </label>
              <p className="mt-2 text-base text-dark dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {user.addresses && user.addresses.length > 0 && (
          <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
              Addresses
            </h2>

            <div className="space-y-6">
              {user.addresses.map((address, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-stroke p-5 dark:border-dark-3"
                >
                  <h3 className="mb-4 text-base font-semibold text-dark dark:text-white">
                    Address {index + 1}
                  </h3>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Type
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.type.join(", ")}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Company Name
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.companyName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        GST No
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.gstNo || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Street
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.street || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Location
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.location || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        City
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.city || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        District
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.district || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        State
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.state || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Country
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.country || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Pincode
                      </label>
                      <p className="mt-1 text-base text-dark dark:text-white">
                        {address.pincode || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
