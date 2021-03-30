import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ContactValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true, escape: true }, [rules.email()]),
    message: schema.string({ trim: true, escape: true }, [rules.maxLength(300)]),
  })

  public messages = {}
}
