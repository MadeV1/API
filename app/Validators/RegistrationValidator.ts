import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegistrationValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    pseudonym: schema.string({ trim: true }, [
      rules.minLength(3),
      rules.maxLength(30),
      rules.unique({ table: 'security_users', column: 'pseudonym' }),
    ]),
    email: schema.string({ trim: true, escape: true }, [
      rules.email(),
      rules.unique({ table: 'security_users', column: 'email' }),
      rules.maxLength(255),
    ]),
    password: schema.string({ trim: true }, [rules.confirmed(), rules.minLength(6)]),
  })
}
