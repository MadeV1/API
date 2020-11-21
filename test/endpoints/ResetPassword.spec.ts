import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import SecurityUser from 'App/Models/SecurityUser'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

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
