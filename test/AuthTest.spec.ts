import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Registration', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.beforeEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure registration endpoint works', async (assert) => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanz@hey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    await supertest(BASE_URL).post('/register').send(inputs).expect(201)
  })

  test('ensure registration failed with bad pseudonym', async () => {
    const inputs = {
      pseudonym: '',
      email: 'romain.lanz@hey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    await supertest(BASE_URL).post('/register').send(inputs).expect(422)
  })

  test('ensure registration failed with bad email', async () => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanzhey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    await supertest(BASE_URL).post('/register').send(inputs).expect(422)
  })

  test('ensure registration failed with password being too short', async () => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanzhey.com',
      password: 'sec',
      password_confirmation: 'sec',
    }

    await supertest(BASE_URL).post('/register').send(inputs).expect(422)
  })

  test('ensure registration failed with passwords being differents', async () => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanzhey.com',
      password: 'secret',
      password_confirmation: 'secrets',
    }

    await supertest(BASE_URL).post('/register').send(inputs).expect(422)
  })
})
