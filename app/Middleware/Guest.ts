import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthMiddleware {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    if (!auth.use('web').isGuest) {
      response.unauthorized({ error: 'Must be logged in' })
      return
    }

    await next()
  }
}
