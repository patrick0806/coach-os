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
            'Configure seus horários de atendimento recorrentes e bloqueie datas em que não estará disponível.',
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
      {
        element: '[data-testid="add-exception-btn"]',
        popover: {
          title: '🚫 Bloquear Data',
          description:
            'Bloqueie datas específicas como feriados ou férias. Esses dias não aparecerão como disponíveis para agendamento.',
          side: 'bottom',
        },
      },
    ],
  })

  driverObj.drive()
}
