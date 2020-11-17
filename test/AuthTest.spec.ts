import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import SecurityUser from 'App/Models/SecurityUser'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Registration', (group) => {
  group.beforeEach(async () => {
    console.log('start DB transaction')
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    console.log('rollback DB transaction')
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

test.group('Login', (group) => {
  group.beforeEach(async () => {
    console.log('start DB transaction')
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    console.log('rollback DB transaction')
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
})
