import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startTrainingTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir',
    steps: [
      {
        popover: {
          title: '🏋️ Programas de Treino',
          description:
            'Crie templates reutilizáveis de programas de treino. Cada template pode ser atribuído a múltiplos alunos como um programa independente.',
        },
      },
      {
        element: '[data-tour="template-filters"]',
        popover: {
          title: '🔍 Filtros',
          description: 'Filtre seus templates por nome ou status para encontrá-los rapidamente.',
          side: 'bottom',
        },
      },
      {
        element: '[data-testid="create-template-button"]',
        popover: {
          title: '➕ Criar Programa',
          description:
            'Crie um novo template com nome e descrição. Depois, adicione dias de treino e exercícios a ele.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="template-grid"]',
        popover: {
          title: '📋 Seus Templates',
          description:
            'Clique em qualquer card para abrir o template e editar os dias de treino, exercícios, séries e repetições.',
          side: 'top',
        },
      },
    ],
  })

  driverObj.drive()
}
