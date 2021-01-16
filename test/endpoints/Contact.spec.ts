import Mail from '@ioc:Adonis/Addons/Mail'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Contact form', () => {
  test('ensure a mail is send when the endpoint is hit', async (assert) => {
    const inputs = {
      email: 'icontactu@hey.com',
      message: 'Message',
    } // Using apos provoques a bug in assertion

    Mail.trap(({ from, text }) => {
      assert.strictEqual(from?.address, inputs.email)
      assert.include(text!, inputs.email)
      assert.include(text!, inputs.message)
    })

    await supertest(BASE_URL).post('/contact').send(inputs).expect(200)
  })

  test('ensure no email is sent if the user did not provide an email address to answer', async () => {
    const inputs = {
      message: 'Message',
    }

    await supertest(BASE_URL).post('/contact').send(inputs).expect(400)
  })

  test('ensure no email is sent if the user did not provide a message', async () => {
    const inputs = {
      email: 'email@hey.com',
    }

    await supertest(BASE_URL).post('/contact').send(inputs).expect(400)
  })

  test('ensure no email is sent if the user provide an invalid email', async () => {
    const inputs = {
      email: 'notAnEmail',
      message: 'Message',
    }

    await supertest(BASE_URL).post('/contact').send(inputs).expect(400)
  })

  test('ensure no email is sent if the user provide a message which is too long', async () => {
    const inputs = {
      email: 'icontactu@hey.com',
      message:
        'MessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessageMessage',
    }

    await supertest(BASE_URL).post('/contact').send(inputs).expect(400)
  })
})
