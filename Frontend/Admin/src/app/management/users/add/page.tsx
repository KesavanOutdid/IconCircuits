"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api-client";
import Swal from "sweetalert2";

interface Role {
  _id: string;
  role_id: number;
  name: string;
}

interface AddressData {
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

interface UserFormData {
  name: string;
  email: string;
  password: string;
  roleId: number;
  phone: string;
  status: boolean;
  addresses: AddressData[];
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  addresses?: { [key: number]: { [key: string]: string } };
}

export default function AddUser() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    roleId: 2,
    phone: "",
    status: true,
    addresses: [
      {
        type: ["delivery"],
        street: "",
        city: "",
        location: "",
        district: "",
        state: "",
        country: "India",
        pincode: "",
        companyName: "",
        gstNo: "",
      },
    ],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiCall<any>(`/api/admin/roles?page=1&limit=100`);

      if (Array.isArray(response)) {
        setRoles(response);
      } else if (response && response.data) {
        setRoles(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      Swal.fire("Error", "Failed to load roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be 50 characters or less";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    } else if (formData.password.length > 50) {
      newErrors.password = "Password must be 50 characters or less";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    const addressErrors: { [key: number]: { [key: string]: string } } = {};
    formData.addresses.forEach((address, index) => {
      const addressErrs: { [key: string]: string } = {};

      if (address.street.trim() && address.street.length > 100) {
        addressErrs.street = "Street must be 100 characters or less";
      }

      if (address.city.trim() && address.city.length > 30) {
        addressErrs.city = "City must be 30 characters or less";
      }

      if (address.state.trim() && address.state.length > 30) {
        addressErrs.state = "State must be 30 characters or less";
      }

      if (address.pincode.trim() && !/^[0-9]{6}$/.test(address.pincode)) {
        addressErrs.pincode = "Pincode must be exactly 6 digits";
      }

      if (address.gstNo && !/^[0-9A-Z]{15}$/.test(address.gstNo)) {
        addressErrs.gstNo = "Invalid GST number format";
      }

      if (Object.keys(addressErrs).length > 0) {
        addressErrors[index] = addressErrs;
      }
    });

    if (Object.keys(addressErrors).length > 0) {
      newErrors.addresses = addressErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    addressIndex?: number
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";

    if (addressIndex !== undefined) {
      const newAddresses = [...formData.addresses];
      if (name === "type") {
        newAddresses[addressIndex].type = value
          .split(",")
          .map((t) => t.trim());
      } else if (name === "pincode") {
        const pincodeOnly = value.replace(/\D/g, "").slice(0, 6);
        (newAddresses[addressIndex] as any)[name] = pincodeOnly;
      } else {
        (newAddresses[addressIndex] as any)[name] = value;
      }
      setFormData({ ...formData, addresses: newAddresses });
    } else {
      if (name === "roleId") {
        setFormData({ ...formData, [name]: parseInt(value) });
      } else if (name === "status") {
        setFormData({ ...formData, [name]: isCheckbox ? (e.target as any).checked : value === "true" });
      } else if (name === "phone") {
        const phoneOnly = value.replace(/\D/g, "").slice(0, 10);
        setFormData({ ...formData, [name]: phoneOnly });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [
        ...formData.addresses,
        {
          type: ["delivery"],
          street: "",
          city: "",
          location: "",
          district: "",
          state: "",
          country: "India",
          pincode: "",
          companyName: "",
          gstNo: "",
        },
      ],
    });
  };

  const removeAddress = (index: number) => {
    setFormData({
      ...formData,
      addresses: formData.addresses.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire("Error", "Please fix the validation errors", "error");
      return;
    }

    try {
      setSubmitting(true);
      await apiCall("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      Swal.fire("Success", "User created successfully", "success");
      router.push("/management/users");
    } catch (error) {
      console.error("Failed to create user:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create user";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark dark:text-white">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-body-1xlg font-bold text-dark dark:text-white">
          ADD NEW USER
        </h1>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-lg bg-gray-300 px-5 py-2 text-sm font-medium text-dark hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-[10px] bg-white px-7.5 pb-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h2 className="mb-6 text-body-lg font-bold text-dark dark:text-white">
            User Information
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-5.5 grid grid-cols-1 gap-5.5 sm:grid-cols-2">
              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  maxLength={50}
                  className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                    errors.name
                      ? "border-red-500 focus:border-red-500 dark:border-red-500"
                      : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.name.length}/50 characters
                </p>
              </div>

              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 dark:border-red-500"
                      : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password (min 4 chars, must contain a number)"
                  maxLength={50}
                  className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 dark:border-red-500"
                      : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.password.length}/50 characters
                </p>
              </div>

              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500 dark:border-red-500"
                      : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.phone.length}/10 digits
                </p>
              </div>

              <div>
                <label className="text-base font-semibold text-dark dark:text-white">
                  Role
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                >
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6 border-t border-stroke pt-6 dark:border-dark-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-body-lg font-bold text-dark dark:text-white">
                  Addresses
                </h3>
                <button
                  type="button"
                  onClick={addAddress}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  Add Address
                </button>
              </div>

              {formData.addresses.map((address, index) => (
                <div
                  key={index}
                  className="mb-6 rounded-lg border border-stroke p-5 dark:border-dark-3"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-base font-semibold text-dark dark:text-white">
                      Address {index + 1}
                    </h4>
                    {formData.addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Type
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={address.type.join(", ")}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="e.g., delivery, invoice"
                        className="mt-2 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={address.companyName}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter company name (max 50 chars)"
                        maxLength={50}
                        className="mt-2 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        GST No
                      </label>
                      <input
                        type="text"
                        name="gstNo"
                        value={address.gstNo}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter GST number (15 chars)"
                        maxLength={15}
                        className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-base text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                          errors.addresses?.[index]?.gstNo
                            ? "border-red-500 focus:border-red-500 dark:border-red-500"
                            : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                        }`}
                      />
                      {errors.addresses?.[index]?.gstNo && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.addresses[index].gstNo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Street
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={address.street}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter street address"
                        maxLength={100}
                        className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-base text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                          errors.addresses?.[index]?.street
                            ? "border-red-500 focus:border-red-500 dark:border-red-500"
                            : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                        }`}
                      />
                      {errors.addresses?.[index]?.street && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.addresses[index].street}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={address.location}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter location"
                        className="mt-2 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter city"
                        maxLength={30}
                        className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-base text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                          errors.addresses?.[index]?.city
                            ? "border-red-500 focus:border-red-500 dark:border-red-500"
                            : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                        }`}
                      />
                      {errors.addresses?.[index]?.city && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.addresses[index].city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        District
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={address.district}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter district"
                        className="mt-2 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter state"
                        maxLength={30}
                        className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-base text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                          errors.addresses?.[index]?.state
                            ? "border-red-500 focus:border-red-500 dark:border-red-500"
                            : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                        }`}
                      />
                      {errors.addresses?.[index]?.state && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.addresses[index].state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={address.country}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter country"
                        className="mt-2 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-base font-semibold text-dark dark:text-white">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={address.pincode}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        className={`mt-2 w-full rounded-lg border-[1.5px] bg-transparent px-5 py-3 text-base text-dark outline-none transition dark:bg-dark-2 dark:text-white ${
                          errors.addresses?.[index]?.pincode
                            ? "border-red-500 focus:border-red-500 dark:border-red-500"
                            : "border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary"
                        }`}
                      />
                      {errors.addresses?.[index]?.pincode && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.addresses[index].pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </button>

              <button
                className="rounded-lg bg-primary px-6 py-[7px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
