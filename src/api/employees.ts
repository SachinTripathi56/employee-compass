import { apiRequest } from "./client";
import type { Employee, EmployeeQuery, ImportResult, Paginated } from "./types";

export const listEmployees = (query: EmployeeQuery = {}) =>
  apiRequest<Paginated<Employee>>("/api/v1/hr/employees", { query: { ...query } });

export const getEmployee = (id: string) => apiRequest<Employee>(`/api/v1/hr/employees/${id}`);

export const createEmployee = (data: Partial<Employee>) =>
  apiRequest<Employee>("/api/v1/hr/employees", { method: "POST", body: data });

export const updateEmployee = (id: string, data: Partial<Employee>) =>
  apiRequest<Employee>(`/api/v1/hr/employees/${id}`, { method: "PUT", body: data });

export const deleteEmployee = (id: string) =>
  apiRequest<void>(`/api/v1/hr/employees/${id}`, { method: "DELETE" });

/** Backend parses and validates the file — the frontend only uploads and displays. */
export const importEmployees = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<ImportResult>("/api/v1/hr/employees/import", { method: "POST", formData });
};

export const getImport = (importId: string) =>
  apiRequest<ImportResult>(`/api/v1/hr/employees/imports/${importId}`);

export const confirmImport = (importId: string) =>
  apiRequest<{ imported: number }>(`/api/v1/hr/employees/imports/${importId}/confirm`, {
    method: "POST",
  });
