import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startExercisesTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir',
    steps: [
      {
        popover: {
          title: '📚 Biblioteca de Exercícios',
          description:
            'Aqui você encontra todos os exercícios disponíveis na plataforma — globais e os seus personalizados.',
        },
      },
      {
        element: 'h1',
        popover: {
          title: 'Exercícios',
          description:
            'Navegue pela biblioteca para visualizar detalhes, grupos musculares, instruções e mídias de cada exercício.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="exercise-filters"]',
        popover: {
          title: '🔍 Filtros',
          description:
            'Pesquise por nome ou filtre por grupo muscular para encontrar rapidamente o exercício que precisa.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="create-exercise-btn"]',
        popover: {
          title: '➕ Criar Exercício Personalizado',
          description:
            'Clique aqui para adicionar seus próprios exercícios com nome, instruções e mídia. Eles ficam visíveis apenas para você.',
          side: 'left',
        },
      },
    ],
  })

  driverObj.drive()
}
