import { api } from "@/lib/axios"

export interface ProfileData {
  id: string
  slug: string
  coachName: string
  bio: string | null
  profilePhoto: string | null
  logoUrl: string | null
  phoneNumber: string | null
  specialties: string[] | null
  themeColor: string | null
  themeColorSecondary: string | null
  lpLayout: string
  lpTitle: string | null
  lpSubtitle: string | null
  lpHeroImage: string | null
  lpAboutTitle: string | null
  lpAboutText: string | null
  lpImage1: string | null
  lpImage2: string | null
  lpImage3: string | null
}

export interface UpdateProfileData {
  bio?: string
  phoneNumber?: string
  specialties?: string[]
  themeColor?: string
  profilePhoto?: string
  logoUrl?: string
  lpTitle?: string
  lpSubtitle?: string
  lpHeroImage?: string
  lpAboutTitle?: string
  lpAboutText?: string
  lpImage1?: string
  lpImage2?: string
  lpImage3?: string
  lpLayout?: string
  themeColorSecondary?: string
}

export interface PhotoUploadResponse {
  uploadUrl: string
  fileUrl: string
}

export const profileService = {
  getMyProfile: async (): Promise<ProfileData> =>
    (await api.get<ProfileData>("/profile")).data,

  update: async (data: UpdateProfileData): Promise<ProfileData> =>
    (await api.put<ProfileData>("/profile", data)).data,

  requestPhotoUpload: async (mimeType: string): Promise<PhotoUploadResponse> =>
    (await api.post<PhotoUploadResponse>("/profile/photo/upload-url", { mimeType })).data,

  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    })
  },
}
