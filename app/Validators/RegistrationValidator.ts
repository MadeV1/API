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
    password: schema.string({}, [rules.confirmed(), rules.minLength(6)]),
  })

  public messages = {
    'pseudonym.required': 'VALIDATION_PSEUDONYM_REQUIRED',
    'email.required': 'VALIDATION_EMAIL_REQUIRED',
    'email.email': 'VALIDATION_EMAIL_FORMAT',
    'email.unique': 'VALIDATION_EMAIL_UNIQUE',
    'email.maxLength': 'VALIDATION_EMAIL_MAXLENGTH',
    'password.minLength': 'VALIDATION_PASSWORD_MINLENGTH',
    'password_confirmation.confirmed': 'VALIDATION_PASSWORD_CONFIRMATION',
  }
}
