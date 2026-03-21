import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startStudentsTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir',
    steps: [
      {
        popover: {
          title: '👥 Gestão de Alunos',
          description:
            'Aqui você gerencia toda a sua base de alunos — cadastro, status, convites e acesso a cada perfil.',
        },
      },
      {
        element: '[data-tour="student-filters"]',
        popover: {
          title: '🔍 Filtros',
          description:
            'Busque por nome ou filtre por status (ativo, pausado, arquivado) para organizar sua lista.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="new-student-btn"]',
        popover: {
          title: '➕ Novo Aluno',
          description:
            'Cadastre um novo aluno diretamente, preenchendo nome, e-mail, telefone e objetivo.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="student-row-actions"]',
        popover: {
          title: '📨 Enviar Convite',
          description:
            'Após cadastrar o aluno, clique nos três pontos (⋯) ao lado do nome e selecione "Enviar convite" para enviar o acesso por e-mail ou gerar um link para WhatsApp.',
          side: 'left',
        },
      },
    ],
  })

  driverObj.drive()
}
