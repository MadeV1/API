import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SendResetMailValidator from 'App/Validators/SendResetMailValidator'

export default class PasswordController {
  public async ask({ request, response }: HttpContextContract) {
    try {
      await request.validate(SendResetMailValidator)

      return {
        code: 'E_RESET_PASSWORD_MAIL_SUCCESS',
      }
    } catch (error) {
      response.status(404).send({
        code: 'E_USER_NOT_FOUND',
        ...error.messages,
      })
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    if (request.hasValidSignature()) {
      return {
        code: 'E_MAIL_RESET_SUCCESS',
      }
    }
    return response.status(400).send({
      code: 'E_INVALID_URL_SIGNATURE',
    })
  }
}
