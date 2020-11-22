import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SendResetMailValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true, escape: true }, [
      rules.email(),
      rules.exists({
        table: 'security_users',
        column: 'email',
      }),
    ]),
  })
}
