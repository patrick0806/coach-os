import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startAvailabilityTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir',
    steps: [
      {
        popover: {
          title: '⏰ Disponibilidade',
          description:
            'Configure seus horários de atendimento recorrentes. Você chegou aqui pela Agenda — use o botão "Voltar para agenda" para retornar quando terminar.',
        },
      },
      {
        element: '[data-testid="open-wizard-btn"]',
        popover: {
          title: '🪄 Configurar em Lote',
          description:
            'Use o assistente para configurar rapidamente seus horários da semana de uma só vez.',
          side: 'left',
        },
      },
      {
        element: '[data-testid="add-rule-btn"]',
        popover: {
          title: '➕ Adicionar Horário',
          description:
            'Defina horários recorrentes por dia da semana — ex: Segunda-feira, 08h às 12h. Esses horários são visíveis para seus alunos.',
          side: 'bottom',
        },
      },
    ],
  })

  driverObj.drive()
}
