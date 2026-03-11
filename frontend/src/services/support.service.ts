import { api } from "@/lib/api";

export interface ContactSupportPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSupportResponse {
  message: string;
}

export async function contactSupport(payload: ContactSupportPayload) {
  const response = await api.post<ContactSupportResponse>("/support/contact", payload);
  return response.data;
}
