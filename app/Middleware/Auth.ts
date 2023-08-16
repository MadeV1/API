import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Auth {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    if (auth.isGuest) {
      response.unauthorized({ error: 'Must be logged in' })
      return
    }

    await next()
  }
}
