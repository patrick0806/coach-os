// Static fixture data for plans (returned as array, not paginated)
export const plansFixtures = [
  {
    id: "plan-basico",
    name: "Básico",
    price: "29.90",
    limitOfStudents: 10,
    hasTrial: true,
    highlighted: false,
    features: ["Gestão de alunos", "Criação de treinos", "Biblioteca de exercícios", "Portal do aluno"],
  },
  {
    id: "plan-pro",
    name: "Pro",
    price: "49.90",
    limitOfStudents: 30,
    hasTrial: false,
    highlighted: true,
    features: ["Tudo do Básico", "Exercícios personalizados", "Página pública", "Personalização de marca"],
  },
  {
    id: "plan-elite",
    name: "Elite",
    price: "99.90",
    limitOfStudents: 100,
    hasTrial: false,
    highlighted: false,
    features: ["Tudo do Pro", "Métricas avançadas", "Histórico completo", "Maior armazenamento"],
  },
]
