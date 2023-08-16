import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import ContactValidator from 'App/Validators/ContactValidator'

export default class ContactController {
  public async contact({ request, response }: HttpContextContract) {
    const { email, message: content } = await request.validate(ContactValidator)
    await Mail.send((message) => {
      message
        .from(email)
        .to('contact@made')
        .replyTo(email)
        .subject('Contact depuis le site')
        .textView('contact', {
          message: content,
          from: `From email: ${email}`,
        })
    })
  }
}
