import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import SecurityUser from 'App/Models/SecurityUser'

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const validationSchema = schema.create({
      pseudonym: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(30)]),
      email: schema.string({ trim: true, escape: true }, [
        rules.email(),
        rules.unique({ table: 'security_users', column: 'email' }),
        rules.maxLength(255),
      ]),
      password: schema.string({ trim: true }, [rules.confirmed(), rules.minLength(6)]),
    })

    const userDetails = await request.validate({ schema: validationSchema })

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
