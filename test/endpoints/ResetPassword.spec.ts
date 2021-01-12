import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import SecurityUser from 'App/Models/SecurityUser'
import Route from '@ioc:Adonis/Core/Route'
import { BASE_URL } from 'test/utils/constants'

test.group('Ask new password', (group) => {
  group.beforeEach(async () => {
    console.log('start DB transaction')
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    console.log('rollback DB transaction')
    await Database.rollbackGlobalTransaction()
  })

  test('ensure user can ask a new password', async () => {
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
    await supertest(BASE_URL).post('/ask-new-password').send(inputs).expect(200)
  })

  test('ensure it sends 404 if user not found', async () => {
    // Test initialization
    const inputs = {
      email: 'hype@hey.com',
    }

    // Test actions
    // We expect a 404 response as the user does not exists
    await supertest(BASE_URL).post('/ask-new-password').send(inputs).expect(404)
  })
})

test.group('Update password', (group) => {
  group.beforeEach(async () => {
    console.log('start DB transaction')
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    console.log('rollback DB transaction')
    await Database.rollbackGlobalTransaction()
  })

  test('ensure a user has a 200 status code when it provides good inputs and its password is updated', async () => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()
    const signedUrl = Route.makeSignedUrl('password.reset', {
      params: {
        email: user.email,
      },
    })

    const inputs = {
      newPassword: 'newSecret',
      newPassword_confirmation: 'newSecret',
    }

    await supertest(BASE_URL).put(signedUrl!).send(inputs).expect(200)
  })

  test('ensure request fails if it does not provide a valid signed url', async () => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()

    const inputs = {
      newPassword: 'newSecret',
      newPassword_confirmation: 'newSecret',
    }

    await supertest(BASE_URL).put('/password/reset/romain.lanz@hey.com').send(inputs).expect(400)
  })

  test('ensure request fails if inputs are not valids', async () => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()
    const signedUrl = Route.makeSignedUrl('password.reset', {
      params: {
        email: user.email,
      },
    })

    const inputs = {
      newPassword: 'newSecret',
      newPassword_confirmation: 'oldSecret',
    }

    await supertest(BASE_URL).put(signedUrl!).send(inputs).expect(422)
  })
})
