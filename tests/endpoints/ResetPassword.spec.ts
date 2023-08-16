import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import SecurityUser from 'App/Models/SecurityUser'
import Route from '@ioc:Adonis/Core/Route'

test.group('Ask new password', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('ensure user can ask a new password', async ({ client }) => {
    // Test initialization
    const user: SecurityUser = new SecurityUser()
    user.pseudonym = 'Hypa'
    user.email = 'hypa@hey.com'
    user.password = 'blabla'
    await user.save()

    const inputs = {
      email: 'hypa@hey.com',
    }

    // Test actions
    const response = await client.post('/ask-new-password').json(inputs).send()

    response.assertStatus(200)
  })

  test('ensure it sends 404 if user not found', async ({ client }) => {
    // Test initialization
    const inputs = {
      email: 'hype@hey.com',
    }

    // Test actions
    // We expect a 404 response as the user does not exists
    const response = await client.post('/ask-new-password').json(inputs).send()

    response.assertStatus(404)
  })
})

test.group('Update password', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('ensure a user has a 200 status code when it provides good inputs and its password is updated', async ({
    client,
  }) => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()
    const signedUrl = Route.makeSignedUrl('password.reset', {
      params: {
        'user(email)': user.email,
      },
    })

    const inputs = {
      newPassword: 'newSecret',
      newPassword_confirmation: 'newSecret',
    }

    const response = await client.put(signedUrl!).json(inputs).send()

    response.assertStatus(200)
  })

  test('ensure request fails if it does not provide a valid signed url', async ({ client }) => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()

    const inputs = {
      newPassword: 'newSecret',
      newPassword_confirmation: 'newSecret',
    }

    const response = await client.put('/password/reset/romain.lanz@hey.com').json(inputs).send()

    response.assertStatus(400)
  })

  test('ensure request fails if inputs are not valids', async ({ client }) => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()
    const signedUrl = Route.makeSignedUrl('password.reset', {
      params: {
        'user(email)': user.email,
      },
    })

    const inputs = {
      newPassword: 'newSecret',
      newPassword_confirmation: 'oldSecret',
    }

    const response = await client.put(signedUrl!).json(inputs).send()

    response.assertStatus(422)
  })
})
