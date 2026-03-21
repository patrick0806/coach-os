import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startServicesTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir',
    steps: [
      {
        popover: {
          title: '💼 Planos de Serviço',
          description:
            'Crie e gerencie os planos que você oferece aos seus alunos — consultoria online, treino presencial, ou ambos.',
        },
      },
      {
        element: '[data-testid="create-plan-button"]',
        popover: {
          title: '➕ Criar Plano',
          description:
            'Defina o nome, tipo (online/presencial), número de sessões por semana, duração e valor do seu plano.',
          side: 'left',
        },
      },
      {
        element: '[data-testid="service-plans-list"]',
        popover: {
          title: '📦 Seus Planos',
          description:
            'Cada card mostra o resumo do plano. Use o menu de ações para editar ou excluir um plano existente.',
          side: 'top',
        },
      },
    ],
  })

  driverObj.drive()
}
