import { api } from "@/lib/axios";

interface JoinWaitlistRequest {
  email: string;
  name?: string;
}

interface JoinWaitlistResponse {
  message: string;
}

export const waitlistService = {
  async join(data: JoinWaitlistRequest): Promise<JoinWaitlistResponse> {
    const response = await api.post<JoinWaitlistResponse>(
      "/waitlist/join",
      data,
    );
    return response.data;
  },
};
