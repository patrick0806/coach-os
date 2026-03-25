import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startScheduleTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir',
    steps: [
      {
        popover: {
          title: '📅 Agenda',
          description:
            'Visualize e gerencie todos os seus agendamentos. O calendário semanal mostra sessões, treinos recorrentes e bloqueios de disponibilidade.',
        },
      },
      {
        element: '[data-tour="weekly-calendar"]',
        popover: {
          title: '🗓️ Calendário Semanal',
          description:
            'Clique em qualquer horário disponível para criar um agendamento diretamente na agenda. Cores diferentes indicam tipos diferentes de eventos.',
          side: 'bottom',
        },
      },
      {
        element: '[data-testid="new-appointment-btn"]',
        popover: {
          title: '➕ Novo Agendamento',
          description:
            'Crie uma sessão online ou presencial com um aluno. Defina data, horário, tipo e local (ou link de reunião).',
          side: 'left',
        },
      },
    ],
  })

  driverObj.drive()
}
