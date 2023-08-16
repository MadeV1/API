import Mail from '@ioc:Adonis/Addons/Mail'
import SecurityUser from 'App/Models/SecurityUser'
import SendResetPasswordUrl from 'App/Services/SendResetPasswordUrl'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Send reset password email service', async (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('Sends email to an account', async ({ assert }) => {
    const mailer = Mail.fake()

    const user = new SecurityUser()
    user.pseudonym = 'JYStory'
    user.email = 'jystory@hey.com'
    user.password = 'password'
    await user.save()

    await SendResetPasswordUrl.send(user)

    assert.isTrue(mailer.exists((mail) => mail.subject === 'Réinitilisation du mot de passe'))
    assert.isTrue(mailer.exists((mail) => mail.text?.includes('?signature=') ?? false))
    assert.isTrue(
      mailer.exists(
        (mail) => mail.to?.some((recipient) => recipient.address === user.email) ?? false
      )
    )
  })
})
