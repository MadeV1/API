import Route from '@ioc:Adonis/Core/Route'
import Mail from '@ioc:Adonis/Addons/Mail'
import SecurityUser from 'App/Models/SecurityUser'

export default class SendResetPasswordUrl {
  public static async send(user: SecurityUser) {
    const signedUrl = Route.makeSignedUrl('password.reset', {
      params: {
        'user(email)': user.email,
      },
    })

    await Mail.send((message) => {
      message
        .from('message@hey.com')
        .to(user.email)
        .subject('Réinitilisation du mot de passe')
        .textView('password/reset', {
          url: process.env.FRONTEND_BASE_URL! + signedUrl,
        })
    })
  }
}
