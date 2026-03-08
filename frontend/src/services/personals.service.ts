import axios from "axios";
import { api } from "@/lib/api";

export interface PersonalProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  slug: string;
  bio: string | null;
  profilePhoto: string | null;
  themeColor: string;
  phoneNumber: string | null;
  lpTitle: string | null;
  lpSubtitle: string | null;
  lpHeroImage: string | null;
  lpAboutTitle: string | null;
  lpAboutText: string | null;
  lpImage1: string | null;
  lpImage2: string | null;
  lpImage3: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  themeColor?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  lpTitle?: string;
  lpSubtitle?: string;
  lpHeroImage?: string;
  lpAboutTitle?: string;
  lpAboutText?: string;
  lpImage1?: string;
  lpImage2?: string;
  lpImage3?: string;
}

export type ImageType =
  | "profilePhoto"
  | "lpHeroImage"
  | "lpImage1"
  | "lpImage2"
  | "lpImage3";

export async function getMyProfile(): Promise<PersonalProfile> {
  const { data } = await api.get<PersonalProfile>("/personals/me/profile");
  return data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<PersonalProfile> {
  const { data } = await api.patch<PersonalProfile>(
    "/personals/me/profile",
    payload,
  );
  return data;
}

export async function uploadProfileImage(
  file: File,
  imageType: ImageType,
): Promise<{ url: string }> {
  const { data } = await api.post<{ uploadUrl: string; publicUrl: string }>(
    "/personals/me/profile/upload",
    {
      fileName: file.name,
      mimeType: file.type,
      imageType,
    },
  );

  await axios.put(data.uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });

  return { url: data.publicUrl };
}
