import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Registration', () => {
  test('ensure registration endpoint works', async (assert) => {
    // Test initialization
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanz@hey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    // Test actions
    const response = await supertest(BASE_URL).post('/register').send(inputs).expect(201)

    // Test assertions
    console.log(response)
  })
})
