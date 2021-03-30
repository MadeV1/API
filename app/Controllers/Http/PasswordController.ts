import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SecurityUser from 'App/Models/SecurityUser'
import SendResetMailValidator from 'App/Validators/SendResetMailValidator'
import UpdatePasswordValidator from 'App/Validators/UpdatePasswordValidator'

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
      await request.validate(UpdatePasswordValidator)
      const user = await SecurityUser.findByOrFail('email', params.email)
      user.password = request.input('newPassword')
      await user.save()
      return {
        code: 'E_MAIL_RESET_SUCCESS',
      }
    }
    return response.status(400).send({
      code: 'E_INVALID_URL_SIGNATURE',
    })
  }
}
