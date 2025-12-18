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
  password: string;
  status: boolean;
}

interface ErrorsType {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
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
  const [initialFormData, setInitialFormData] = useState<ProfileData | null>(null);
  const [errors, setErrors] = useState<ErrorsType>({});

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
        setLoading(false);
        return;
      }

      const data = await apiCall<ProfileData>(
        `/api/admin/auth/profile?profileId=${user.userId}`
      );

      const profileData: ProfileData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || null,
        password: data.password || "", // ✅ KEEP PASSWORD FROM API
        status: data.status !== undefined ? data.status : true,
      };

      setFormData(profileData);
      setInitialFormData({ ...profileData });
    } catch (error) {
      Swal.fire("Error", "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // Check if any field is changed
  const hasChanges = (): boolean => {
    if (!initialFormData) return false;

    return (
      formData.name !== initialFormData.name ||
      formData.email !== initialFormData.email ||
      formData.phone !== initialFormData.phone ||
      formData.password !== initialFormData.password || // password compare
      formData.status !== initialFormData.status
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const phoneOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        phone: phoneOnly,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges()) {
      Swal.fire("Info", "No changes were made", "info");
      return;
    }

    try {
      setSubmitting(true);

      const updateBody = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        status: formData.status,
        password: formData.password, // ✅ KEEP PASSWORD ALWAYS
      };

      await apiCall(`/api/admin/auth/profile`, {
        method: "PUT",
        body: JSON.stringify(updateBody),
      });

      // ✅ DO NOT RESET PASSWORD
      setInitialFormData({ ...formData });

      Swal.fire("Success", "Profile updated successfully", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to update profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p>Please login to access settings</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <h1 className="mb-6 text-body-1xlg font-bold text-dark">SETTINGS</h1>

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
                  placeholder="1234567890"
                  value={formData.phone || ""}
                  handleChange={handleChange}
                  icon={<CallIcon />}
                  iconPosition="left"
                  height="sm"
                  maxLength="10"
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
                value={formData.password}
                handleChange={handleChange}
                icon={<UserIcon />}
                iconPosition="left"
                height="sm"
                autoComplete="current-password" // ✅ Enable autofill
              />

              <div className="flex justify-end gap-3">
                <button
                  className="rounded-lg border px-6 py-[7px]"
                  type="button"
                  onClick={() => {
                    setFormData(initialFormData || formData);
                    setErrors({});
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  className="rounded-lg bg-primary px-6 py-[7px] text-gray-2 hover:bg-opacity-90 disabled:opacity-50"
                  type="submit"
                  disabled={submitting || !hasChanges()}
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
}
