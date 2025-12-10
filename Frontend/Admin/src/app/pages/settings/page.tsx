"use client";

import { useEffect, useState } from "react";
import {
  CallIcon,
  EmailIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { apiCall } from "@/lib/api-client";
import { useAuth } from "@/context/auth";
import Swal from "sweetalert2";

interface ProfileData {
  name: string;
  email: string;
  phone: string | null;
  password?: string;
  status: boolean;
}

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: null,
    password: "",
    status: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.userId) {
      fetchProfileData();
    } else if (!authLoading && !user?.userId) {
      setLoading(false);
    }
  }, [authLoading, user?.userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      if (!user?.userId) {
        console.warn("No userId found in user context");
        setLoading(false);
        return;
      }

      console.log("Fetching profile for userId:", user.userId);
      const data = await apiCall<ProfileData>(`/api/admin/auth/profile?profileId=${user.userId}`);
      console.log("Profile data received:", data);
      
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || null,
        password: data.password || "",
        status: data.status !== undefined ? data.status : true,
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      Swal.fire("Error", `Failed to load profile: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const phoneOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: phoneOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name as keyof ProfileData]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      Swal.fire("Error", "Please fill in all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      
      if (!user?.userId) {
        Swal.fire("Error", "User ID not found. Please login again.", "error");
        return;
      }

      const updateBody: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        status: formData.status,
      };

      if (formData.password) {
        updateBody.password = formData.password;
      }

      console.log("Sending update payload:", updateBody);

      await apiCall(`/api/admin/auth/profile`, {
        method: "PUT",
        body: JSON.stringify(updateBody),
      });
      
      console.log("Profile updated successfully");
      
      Swal.fire("Success", "Profile updated successfully", "success");
      
      await fetchProfileData();
    } catch (error) {
      console.error("Failed to update profile:", error);
      Swal.fire("Error", "Failed to update profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark dark:text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark dark:text-white">Please login to access settings</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <h1 className="mb-6 text-body-1xlg font-bold text-dark dark:text-white">
        SETTINGS
      </h1>

      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <ShowcaseSection title="Personal Information" className="!p-7">
            <form onSubmit={handleSubmit}>
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <InputGroup
                  className="w-full sm:w-1/2"
                  type="text"
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  handleChange={handleChange}
                  icon={<UserIcon />}
                  iconPosition="left"
                  height="sm"
                />

                <InputGroup
                  className="w-full sm:w-1/2"
                  type="text"
                  name="phone"
                  label="Phone Number"
                  placeholder="+1234567890"
                  value={formData.phone || ""}
                  handleChange={handleChange}
                  icon={<CallIcon />}
                  iconPosition="left"
                  height="sm"
                />
              </div>

              <InputGroup
                className="mb-5.5"
                type="email"
                name="email"
                label="Email Address"
                placeholder="john@example.com"
                value={formData.email}
                handleChange={handleChange}
                icon={<EmailIcon />}
                iconPosition="left"
                height="sm"
                disabled
              />

              <InputGroup
                className="mb-5.5"
                type="text"
                name="password"
                label="Password"
                placeholder="Enter password"
                value={formData.password || ""}
                handleChange={handleChange}
                icon={<UserIcon />}
                iconPosition="left"
                height="sm"
              />

              <div className="flex justify-end gap-3">
                <button
                  className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                  type="button"
                  onClick={() => fetchProfileData()}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-50"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </ShowcaseSection>
        </div>
      </div>
    </div>
  );
};

