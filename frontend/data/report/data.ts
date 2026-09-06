import { api } from "@/lib/api";
import {
  Report,
  ReportCreatePayload,
  ReportListResponse,
  ReportResponse,
  ReportUpdatePayload,
} from "@/types/report";

export const fetchReportsByMember = async (userId: number): Promise<ReportListResponse> => {
  return api.get<ReportListResponse>(`/reports/member/${userId}`);
};

export const fetchAllReports = async (userId?: number): Promise<ReportListResponse> => {
  if (userId !== undefined) {
    return fetchReportsByMember(userId);
  }

  return api.get<ReportListResponse>("/reports");
};

export const createReport = async (payload: ReportCreatePayload): Promise<ReportResponse> => {
  return api.post<ReportResponse>("/reports/", payload);
};

export const updateReport = async (reportId: number, payload: ReportUpdatePayload): Promise<ReportResponse> => {
  return api.put<ReportResponse>(`/reports/${reportId}`, payload);
};

export const submitReport = async (reportId: number): Promise<ReportResponse> => {
  return api.post<ReportResponse>(`/reports/${reportId}/submit`);
};

export const deleteReport = async (reportId: number): Promise<ReportResponse> => {
  return api.delete<ReportResponse>(`/reports/${reportId}`);
};

export const getReportById = async (reportId: number): Promise<ReportResponse> => {
  return api.get<ReportResponse>(`/reports/${reportId}`);
};

export const fetchReportsForCurrentUser = async (userId: number): Promise<Report[]> => {
  const response = await fetchReportsByMember(userId);
  return response.data ?? [];
};