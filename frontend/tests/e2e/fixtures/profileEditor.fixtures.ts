export const MOCK_PROFILE_SLUG = "joao-silva"
export const MOCK_PROFILE_ID = "profile-123"

const baseProfile = {
  id: MOCK_PROFILE_ID,
  slug: MOCK_PROFILE_SLUG,
  coachName: "João Silva",
  bio: "Personal trainer especializado em treinamento funcional com 10 anos de experiência.",
  profilePhoto: null,
  logoUrl: null,
  phoneNumber: "(11) 98765-4321",
  specialties: ["Funcional", "Musculação"],
  themeColor: "#0066CC",
  themeColorSecondary: null,
  lpLayout: "1",
  lpTitle: "Transforme seu corpo",
  lpSubtitle: "Treino personalizado para seus objetivos",
  lpHeroImage: null,
  lpAboutTitle: "Sobre mim",
  lpAboutText: "Treinador dedicado a resultados reais com 10 anos de experiência.",
  lpImage1: null,
  lpImage2: null,
  lpImage3: null,
  lpDraftData: null,
}

export const profileEditorFixtures = {
  complete: baseProfile,
  minimal: {
    ...baseProfile,
    bio: null,
    phoneNumber: null,
    specialties: null,
    lpTitle: null,
    lpSubtitle: null,
    lpAboutTitle: null,
    lpAboutText: null,
    lpDraftData: null,
  },
  updated: {
    ...baseProfile,
    bio: "Bio atualizada com sucesso.",
    phoneNumber: "(11) 91234-5678",
    lpDraftData: null,
  },
  withDraft: {
    ...baseProfile,
    lpDraftData: {
      lpLayout: "2",
      lpTitle: "Título do rascunho",
      lpSubtitle: "Subtítulo do rascunho",
    },
  },
}
