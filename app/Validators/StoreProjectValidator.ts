import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreProjectValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true, escape: true }, [
      rules.unique({ table: 'projects', column: 'name' }),
    ]),
    type: schema.string({}, [rules.exists({ table: 'categories', column: 'name' })]),
    difficulty: schema.enum(['easy', 'medium', 'hard']),
    sketch: schema.string({}, [
      rules.url({
        ensureProtocol: 'https',
        hostWhitelist: ['figma.com', 'www.figma.com'],
      }),
    ]),
    answer: schema.string({}, [
      rules.url({
        ensureProtocol: 'https',
        hostWhitelist: ['github.com', 'www.github.com'],
      }),
    ]),
    image: schema.file({
      size: '2mb',
      extnames: ['png', 'webp', 'jpg', 'jpeg'],
    }),
  })

  public messages = {}
}
