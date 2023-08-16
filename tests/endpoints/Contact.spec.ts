import Mail from '@ioc:Adonis/Addons/Mail'
import { test } from '@japa/runner'

test.group('Contact form', () => {
  test('ensure a mail is send when the endpoint is hit', async ({ assert, client }) => {
    const mailer = Mail.fake()

    const inputs = {
      email: 'icontactu@hey.com',
      message: 'Message',
    } // Using apos provoques a bug in assertion

    const response = await client.post('/contact').json(inputs).send()

    assert.isTrue(
      mailer.exists(
        (mail) =>
          mail.replyTo?.map((recipient) => recipient.address).includes(inputs.email) ?? false
      )
    )
    assert.isTrue(mailer.exists((mail) => mail.text?.includes(inputs.email) ?? false))
    assert.isTrue(mailer.exists((mail) => mail.text?.includes(inputs.message) ?? false))

    response.assertStatus(200)
  })

  test('ensure no email is sent if the user did not provide an email address to answer', async ({
    assert,
    client,
  }) => {
    const mailer = Mail.fake()

    const inputs = {
      message: 'Message',
    }

    const response = await client.post('/contact').json(inputs).send()

    response.assertStatus(422)
    assert.isFalse(mailer.exists((mail) => mail.text?.includes(inputs.message) ?? false))
  })

  test('ensure no email is sent if the user did not provide a message', async ({
    assert,
    client,
  }) => {
    const mailer = Mail.fake()

    const inputs = {
      email: 'email@hey.com',
    }

    const response = await client.post('/contact').json(inputs).send()

    response.assertStatus(422)
    assert.isFalse(
      mailer.exists(
        (mail) =>
          mail.replyTo?.map((recipient) => recipient.address).includes(inputs.email) ?? false
      )
    )
  })

  test('ensure no email is sent if the user provide an invalid email', async ({
    assert,
    client,
  }) => {
    const mailer = Mail.fake()

    const inputs = {
      email: 'notAnEmail',
      message: 'Message',
    }

    const response = await client.post('/contact').json(inputs).send()

    response.assertStatus(422)

    assert.isFalse(mailer.exists((mail) => mail.text?.includes(inputs.message) ?? false))
    assert.isFalse(
      mailer.exists(
        (mail) =>
          mail.replyTo?.map((recipient) => recipient.address).includes(inputs.email) ?? false
      )
    )
  })

  test('ensure no email is sent if the user provide a message which is too long', async ({
    client,
  }) => {
    const inputs = {
      email: 'icontactu@hey.com',
      message:
        'MessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessage',
    }

    const response = await client.post('/contact').json(inputs).send()

    response.assertStatus(422)
  })
})
