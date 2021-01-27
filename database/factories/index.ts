import Factory from '@ioc:Adonis/Lucid/Factory'
import Category from 'App/Models/Category'
import Project from 'App/Models/Project'
import SecurityUser from 'App/Models/SecurityUser'

export const SecurityUserFactory = Factory.define(SecurityUser, ({ faker }) => {
  return {
    pseudonym: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}).build()

export const CategoryFactory = Factory.define(Category, () => {
  return {
    name: ['frontend', 'backend', 'fullstack'][Math.floor(Math.random() * 3)],
  }
}).build()

export const ProjectFactory = Factory.define(Project, ({ faker }) => {
  return {
    name: faker.random.uuid(),
    difficulty: faker.random.word(),
    sketch: faker.internet.url(),
    answer: faker.internet.url(),
  }
})
  .relation('user', () => SecurityUserFactory)
  .relation('category', () => CategoryFactory)
  .build()
