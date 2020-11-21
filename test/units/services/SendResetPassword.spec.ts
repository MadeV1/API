import Mail, { RecipientNode } from '@ioc:Adonis/Addons/Mail'
import SecurityUser from 'App/Models/SecurityUser'
import SendResetPasswordUrl from 'App/Services/SendResetPasswordUrl'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'

test.group('Send reset password email service', async (group) => {
  group.beforeEach(async () => {
    console.log('start DB transaction')
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    console.log('rollback DB transaction')
    await Database.rollbackGlobalTransaction()
  })

  test('Sends email to an account', async (assert) => {
    const user = new SecurityUser()
    user.pseudonym = 'JYStory'
    user.email = 'jystory@hey.com'
    user.password = 'password'
    await user.save()

    Mail.trap(async ({ to, subject, text }) => {
      assert.strictEqual(user.email, to![0].address)
      assert.strictEqual('Réinitilisation du mot de passe', subject)
      assert.include(text!, '?signature=')
    })

    SendResetPasswordUrl.send(user)
  })
})
