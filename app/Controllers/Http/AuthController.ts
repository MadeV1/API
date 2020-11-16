import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SecurityUser from 'App/Models/SecurityUser'
import RegistrationValidator from 'App/Validators/RegistrationValidator'

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const userDetails = await request.validate(RegistrationValidator)

    const user: SecurityUser = new SecurityUser()
    user.pseudonym = userDetails.pseudonym
    user.email = userDetails.email
    user.password = userDetails.password
    await user.save()

    return response.status(201).send({
      message: 'Your account has been successfully create',
      data: { user },
    })
  }
}
