import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import ContactValidator from 'App/Validators/ContactValidator'

export default class ContactController {
  public async contact({ request, response }: HttpContextContract) {
    try {
      const { email } = await request.validate(ContactValidator)
      await Mail.send((message) => {
        message
          .from(email)
          .to('contact@made')
          .subject('Contact depuis le site')
          .textView('contact', {
            message: request.input('message'),
            from: `From email: ${email}`,
          })
      })
    } catch (error) {
      return response.status(400).send(error)
    }
  }
}
