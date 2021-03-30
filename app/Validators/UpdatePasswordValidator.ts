import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    newPassword: schema.string({}, [rules.confirmed(), rules.minLength(6)]),
  })
}
