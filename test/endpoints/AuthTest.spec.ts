import test, { only } from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import SecurityUser from 'App/Models/SecurityUser'
import { SecurityUserFactory } from 'Database/factories'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

async function actingAs(user?: SecurityUser) {
  const agent = supertest.agent(BASE_URL)

  if (!user) {
    user = await SecurityUserFactory.create()
    await user.refresh()
  }
  user.password = 'secret'
  await user.save()

  await agent
    .post('/login')
    .send({
      email: user.email,
      password: 'secret',
    })
    .withCredentials()

  return { user, agent }
}

test.group('Registration', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
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

    const user = await SecurityUser.findBy('pseudonym', 'Romain Lanz')
    assert.equal(user?.pseudonym, inputs.pseudonym)
  })

  test('ensure user cannot register if email is already in use', async (assert) => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()

    const inputs = {
      pseudonym: 'Swith Jeremy',
      email: 'romain.lanz@hey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    const response = await supertest(BASE_URL).post('/register').send(inputs).expect(422)

    assert.deepInclude(response.body.errors, {
      rule: 'unique',
      field: 'email',
      message: 'unique validation failure',
    })
    assert.lengthOf(response.body.errors, 1)
  })

  test('ensure user cannot register if pseudonym is already in use', async (assert) => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()

    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'swith.jeremy@hey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    const response = await supertest(BASE_URL).post('/register').send(inputs).expect(422)

    assert.deepInclude(response.body.errors, {
      rule: 'unique',
      field: 'pseudonym',
      message: 'unique validation failure',
    })
    assert.lengthOf(response.body.errors, 1)
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
      email: 'romain.lanz@hey.com',
      password: 'sec',
      password_confirmation: 'sec',
    }

    await supertest(BASE_URL).post('/register').send(inputs).expect(422)
  })

  test('ensure registration failed with passwords being differents', async () => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanz@hey.com',
      password: 'secret',
      password_confirmation: 'secrets',
    }

    await supertest(BASE_URL).post('/register').send(inputs).expect(422)
  })
})

test.group('Login', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure a user can login with correct credentials', async () => {
    const user = new SecurityUser()
    user.pseudonym = 'Swith Jeremy'
    user.email = 'swith.jeremy@hey.com'
    user.password = 'secret'
    await user.save()

    const inputs = {
      email: 'swith.jeremy@hey.com',
      password: 'secret',
    }

    await supertest(BASE_URL).post('/login').send(inputs).expect(200)
  })

  test('ensure login fails with invalid credentials', async () => {
    const user = new SecurityUser()
    user.pseudonym = 'Swith Jeremy'
    user.email = 'swith.jeremy@hey.com'
    user.password = 'secret'
    await user.save()

    const inputs = {
      email: 'swith.jeremy@hey.com',
      password: 'password',
    }

    await supertest(BASE_URL).post('/login').send(inputs).expect(400)
  })

  // TO DO: Add a test to disable login for logged in users
})

test.group('Get current user', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure a logged user can retrieve its information', async (assert) => {
    const { user, agent } = await actingAs()
    await user.refresh()

    const { body } = await agent.get('/me').expect(200)

    assert.deepEqual(user.serialize(), body)
  })

  test('ensure a guest has unauthorized error code while trying to fetch current user', async () => {
    await supertest(BASE_URL).get('/me').expect(401)
  })
})
