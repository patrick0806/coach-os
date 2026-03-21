import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startProfileTour() {
  const driverObj = driver({
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir',
    steps: [
      {
        popover: {
          title: '⚙️ Configurações',
          description:
            'Gerencie as configurações da sua conta, como segurança e preferências pessoais.',
        },
      },
      {
        element: '[data-tour="change-password-form"]',
        popover: {
          title: '🔒 Alterar Senha',
          description:
            'Troque sua senha sempre que necessário. Use uma senha forte com pelo menos 8 caracteres.',
          side: 'top',
        },
      },
    ],
  })

  driverObj.drive()
}
