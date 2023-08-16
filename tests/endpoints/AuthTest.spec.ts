import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import SecurityUser from 'App/Models/SecurityUser'

test.group('Registration', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('ensure registration endpoint works', async ({ client, assert }) => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanz@hey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    const response = await client.post('/register').json(inputs).send()

    response.assertStatus(201)

    assert.equal(
      (await SecurityUser.findBy('pseudonym', 'Romain Lanz'))?.pseudonym,
      inputs.pseudonym
    )
  })

  test('ensure user cannot register if email is already in use', async ({ client, assert }) => {
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

    const response = await client.post('/register').json(inputs).send()

    response.assertStatus(422)

    const body = response.body()

    assert.deepInclude(body.errors, {
      rule: 'unique',
      field: 'email',
      message: 'VALIDATION_EMAIL_UNIQUE',
    })
    assert.lengthOf(body.errors, 1)
  })

  test('ensure user cannot register if pseudonym is already in use', async ({ client, assert }) => {
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

    const response = await client.post('/register').json(inputs).send()

    response.assertStatus(422)

    const body = response.body()

    assert.deepInclude(body.errors, {
      rule: 'unique',
      field: 'pseudonym',
      message: 'VALIDATION_PSEUDONYM_UNIQUE',
    })
    assert.lengthOf(body.errors, 1)
  })

  test('ensure registration failed with bad pseudonym', async ({ client }) => {
    const inputs = {
      pseudonym: '',
      email: 'romain.lanz@hey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    const response = await client.post('/register').json(inputs).send()

    response.assertStatus(422)
  })

  test('ensure registration failed with bad email', async ({ client }) => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanzhey.com',
      password: 'secret',
      password_confirmation: 'secret',
    }

    const response = await client.post('/register').json(inputs).send()

    response.assertStatus(422)
  })

  test('ensure registration failed with password being too short', async ({ client }) => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanz@hey.com',
      password: 'sec',
      password_confirmation: 'sec',
    }

    const response = await client.post('/register').json(inputs).send()

    response.assertStatus(422)
  })

  test('ensure registration failed with passwords being differents', async ({ client }) => {
    const inputs = {
      pseudonym: 'Romain Lanz',
      email: 'romain.lanz@hey.com',
      password: 'secret',
      password_confirmation: 'secrets',
    }

    const response = await client.post('/register').json(inputs).send()

    response.assertStatus(422)
  })
})

test.group('Login', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('ensure a user can login with correct credentials', async ({ client }) => {
    const user = new SecurityUser()
    user.pseudonym = 'Swith Jeremy'
    user.email = 'swith.jeremy@hey.com'
    user.password = 'secret'
    await user.save()

    const inputs = {
      email: 'swith.jeremy@hey.com',
      password: 'secret',
    }

    const response = await client.post('/login').json(inputs).send()

    response.assertStatus(200)
  })

  test('ensure login fails with invalid credentials', async ({ client }) => {
    const user = new SecurityUser()
    user.pseudonym = 'Swith Jeremy'
    user.email = 'swith.jeremy@hey.com'
    user.password = 'secret'
    await user.save()

    const inputs = {
      email: 'swith.jeremy@hey.com',
      password: 'password',
    }

    const response = await client.post('/login').json(inputs).send()

    response.assertStatus(400)
  })

  // TO DO: Add a test to disable login for logged in users
})

test.group('Get current user', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('ensure a logged user can retrieve its information', async ({ client }) => {
    const user = new SecurityUser()
    user.pseudonym = 'Swith Jeremy'
    user.email = 'swith.jeremy@hey.com'
    user.password = 'secret'
    await user.save()

    const refreshedUser = await user.refresh()

    const response = await client.get('/me').loginAs(refreshedUser)

    response.assertStatus(200)
    response.assertBody(user.serialize())
  })

  test('ensure a guest has unauthorized error code while trying to fetch current user', async ({
    client,
  }) => {
    const response = await client.get('/me').send()

    response.assertStatus(401)
  })
})
