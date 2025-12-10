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

interface User {
  _id: string;
  userId: number;
  name: string;
  email: string;
  roleId: number;
  phone: string;
  status: boolean;
  createdAt: string;
}

interface UsersApiResponse {
  success: boolean;
  data: User[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

interface Role {
  _id: string;
  role_id: number;
  name: string;
}

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, [currentPage]);

  const fetchRoles = async () => {
    try {
      const response = await apiCall<any>(`/api/admin/roles?page=1&limit=100`);
      
      if (Array.isArray(response)) {
        setRoles(response);
      } else if (response && response.data) {
        setRoles(Array.isArray(response.data) ? response.data : []);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall<User[]>(
        `/api/admin/users?page=${currentPage}&limit=10`,
        {},
        true
      ) as any;
      
      if (response && response.data && response.pagination) {
        setUsers(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.pagination.totalPages || 1);
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.role_id === roleId);
    return role?.name || "Unknown";
  };

  const handleDelete = async (userId: string, userName: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${userName}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await apiCall(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been successfully deleted.",
          confirmButtonText: "OK",
        });

        fetchUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Failed to delete user",
        });
      }
    }
  };

  return (
    <>
     

      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="mb-4 text-body-1xlg font-bold text-dark dark:text-white">
            USERS LIST
          </h2>
          <button
            onClick={() => router.push("/management/users/add")}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
          >
            Add New User
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 uppercase [&>th]:py-4 [&>th]:text-sm [&>th]:text-dark [&>th]:dark:text-white [&>th]:text-center [&>th]:flex-1">
              <TableHead className="!text-left ">
                SI.NO
              </TableHead>
              <TableHead className="!text-center">Name</TableHead>
              <TableHead className="!text-center">Email</TableHead>
              <TableHead className="!text-center">Role</TableHead>
              <TableHead className="!text-center">Phone</TableHead>
              <TableHead className="!text-center">Status</TableHead>
              <TableHead className="!text-right xl:pr-7.5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-dark dark:text-white">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-dark dark:text-white">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow
                  key={user._id}
                  className="border-[#eee] text-center text-base font-normal text-dark dark:border-dark-3 dark:text-white [&>td]:py-5 [&>td]:flex-1"
                >
                  <TableCell className="!text-left xl:pl-7.5">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {(currentPage - 1) * 10 + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="!text-center">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {user.name}
                    </p>
                  </TableCell>
                  <TableCell className="!text-center">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {user.email}
                    </p>
                  </TableCell>
                  <TableCell className="!text-center">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {getRoleName(user.roleId)}
                    </p>
                  </TableCell>
                  <TableCell className="!text-center">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {user.phone}
                    </p>
                  </TableCell>
                  <TableCell className="!text-center">
                    <span
                      className={`inline-flex rounded-full px-3.5 py-1 text-base font-normal ${
                        user.status
                          ? "bg-[#219653]/[0.08] text-[#219653]"
                          : "bg-[#DC3545]/[0.08] text-[#DC3545]"
                      }`}
                    >
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="!text-right xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-4">
                      <button
                        onClick={() => router.push(`/management/users/${user._id}`)}
                        className="inline-flex items-center justify-center text-primary hover:text-opacity-80"
                        title="View user"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => router.push(`/management/users/${user._id}/edit`)}
                        className="inline-flex items-center justify-center text-primary hover:text-opacity-80"
                        title="Edit user"
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
