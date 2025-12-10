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

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface ContactsApiResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ManageContacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await apiCall<any>(
        `/api/admin/contacts?page=${currentPage}&limit=10`
      );

      if (Array.isArray(response)) {
        setContacts(response);
        setTotalPages(1);
      } else if (response && response.data) {
        setContacts(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setContacts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
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
            CONTACTS LIST
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 uppercase [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white [&>th]:text-center [&>th]:flex-1">
              <TableHead className="!text-left">
                SI.NO
              </TableHead>
              <TableHead className="!text-left">
                Name
              </TableHead>
              <TableHead className="!text-left">Email</TableHead>
              <TableHead className="!text-left">Subject</TableHead>
              <TableHead className="!text-center">Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-dark dark:text-white">
                  Loading...
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-dark dark:text-white">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact, index) => (
                <TableRow
                  key={contact._id}
                  className="border-[#eee] text-center text-base font-normal text-dark dark:border-dark-3 dark:text-white [&>td]:py-5 [&>td]:flex-1"
                >
                  <TableCell className="!text-left xl:pl-7.5">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {(currentPage - 1) * 10 + index + 1}
                    </p>
                  </TableCell>
                  <TableCell className="!text-left">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {contact.name}
                    </p>
                  </TableCell>
                  <TableCell className="!text-left">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {contact.email}
                    </p>
                  </TableCell>
                  <TableCell className="!text-left">
                    <p className="truncate text-base font-normal text-dark dark:text-white" title={contact.subject}>
                      {contact.subject}
                    </p>
                  </TableCell>
                  <TableCell className="!text-center">
                    <p className="text-base font-normal text-dark dark:text-white">
                      {formatDate(contact.createdAt)}
                    </p>
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
