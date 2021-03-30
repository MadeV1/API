import Factory from '@ioc:Adonis/Lucid/Factory'
import Category from 'App/Models/Category'
import Project from 'App/Models/Project'
import SecurityUser from 'App/Models/SecurityUser'
import { v4 as uuid } from 'uuid'

export const SecurityUserFactory = Factory.define(SecurityUser, ({ faker }) => {
  return {
    pseudonym: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    job: ['développeur', 'designer', 'chef de projet'][Math.floor(Math.random() * 3)],
  }
}).build()

export const CategoryFactory = Factory.define(Category, () => {
  return {
    name: ['frontend', 'backend', 'fullstack'][Math.floor(Math.random() * 3)],
  }
}).build()

export const ProjectFactory = Factory.define(Project, ({ faker }) => {
  const difficulties = ['easy', 'medium', 'hard']
  return {
    name: `${uuid().slice(0, 4)}-${faker.random.word()}`,
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    sketch: `https://figma.com/file/${uuid()}`,
    answer: `https://github.com/${uuid()}`,
    body: faker.lorem.words(300),
  }
})
  .relation('user', () => SecurityUserFactory)
  .relation('category', () => CategoryFactory)
  .build()
