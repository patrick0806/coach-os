import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startLandingPageTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir',
    steps: [
      {
        popover: {
          title: '🌐 Página Pública',
          description:
            'Configure seu perfil profissional e sua landing page. Essa é a sua vitrine para novos alunos.',
        },
      },
      {
        element: '[data-tour="save-draft-btn"]',
        popover: {
          title: '💾 Salvar Rascunho',
          description:
            'Salve suas alterações sem publicar. O rascunho fica visível apenas para você até ser publicado.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="publish-btn"]',
        popover: {
          title: '🚀 Publicar',
          description:
            'Quando estiver satisfeito com o rascunho, publique para que todos vejam sua página atualizada.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="view-page-link"]',
        popover: {
          title: '👁️ Visualizar Página',
          description: 'Clique aqui para ver como sua página pública aparece para visitantes.',
          side: 'bottom',
        },
      },
    ],
  })

  driverObj.drive()
}
