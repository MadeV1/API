import { bind } from '@adonisjs/route-model-binding'
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
      return response.status(404).send({
        code: 'E_USER_NOT_FOUND',
        ...error.messages,
      })
    }
  }

  @bind()
  public async update({ request, response }: HttpContextContract, user: SecurityUser) {
    if (request.hasValidSignature()) {
      await request.validate(UpdatePasswordValidator)
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
