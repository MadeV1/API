import Factory from '@ioc:Adonis/Lucid/Factory'
import SecurityUser from 'App/Models/SecurityUser'

export const SecurityUserFactory = Factory.define(SecurityUser, ({ faker }) => {
  return {
    pseudonym: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}).build()
