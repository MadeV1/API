import Database from '@ioc:Adonis/Lucid/Database'
import Project from 'App/Models/Project'
import SecurityUser from 'App/Models/SecurityUser'
import test, { group } from 'japa'
import supertest from 'supertest'
import fs from 'fs'
import { ProjectFactory, SecurityUserFactory } from 'Database/factories'
import Category from 'App/Models/Category'

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

test.group('Project tests', (group) => {
  group.before(async () => {
    const categories: string[] = ['frontend', 'backend', 'fullstack']
    categories.forEach(async (categoryName) => {
      const category = new Category()
      category.name = categoryName
      await category.save()
    })
  })

  group.after(async () => {
    const categories = await Category.all()
    categories.forEach(async (category) => await category.delete())
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  /* Project index */
  test('ensure it list last 5 projects by default', async (assert) => {
    await ProjectFactory.createMany(5)

    const response = await supertest(BASE_URL).get('/projects')

    assert.lengthOf(response.body.data, 5)
  })

  test('ensure it list the specified amount of project', async (assert) => {
    await ProjectFactory.createMany(20)

    const response = await supertest(BASE_URL).get('/projects?perPage=10')

    assert.lengthOf(response.body.data, 10)
  })

  test('ensure it can filter projects by category', async (assert) => {
    await ProjectFactory.merge({ categoryId: 1 }).createMany(5)
    await ProjectFactory.merge({ categoryId: 2 }).createMany(5)
    await ProjectFactory.merge({ categoryId: 3 }).createMany(5)

    const response = await supertest(BASE_URL).get('/projects?perPage=10&category=frontend')

    assert.lengthOf(response.body.data, 5)
  })

  test('ensure it can filter projects by difficulty', async (assert) => {
    await ProjectFactory.merge({ difficulty: 'easy' }).createMany(5)
    await ProjectFactory.merge({ difficulty: 'medium' }).createMany(5)
    await ProjectFactory.merge({ difficulty: 'hard' }).createMany(5)

    const response = await supertest(BASE_URL).get('/projects?perPage=10&difficulty=easy')

    assert.lengthOf(response.body.data, 5)
  })

  test('ensure it can filter projects by name', async (assert) => {
    await ProjectFactory.merge({ name: 'Made' }).create()
    await ProjectFactory.createMany(10)

    const response = await supertest(BASE_URL).get('/projects?perPage=10&name=made')

    assert.lengthOf(response.body.data, 1)
    assert.equal(response.body.data[0].name, 'Made')
  })

  /* Project creation */
  test('ensure we can create a projet with valid input if we are logged', async (assert) => {
    const { agent, user } = await actingAs()

    const inputs = {
      name: 'Made',
      type: 'backend',
      difficulty: 'easy',
      sketch: 'https://www.figma.com/file/MPf4qYhf53RG2CDsglNlAS/Untitled',
      answer: 'https://www.github.com/MadeV1/API',
    }

    await agent
      .post('/projects')
      .set('Content-Type', 'multipart/form-data')
      .field('name', inputs.name)
      .field('type', inputs.type)
      .field('difficulty', inputs.difficulty)
      .field('sketch', inputs.sketch)
      .field('answer', inputs.answer)
      .attach('image', 'fixtures/images/project_thumbnail.webp')

    const project = await Project.query()
      .preload('category')
      .preload('user')
      .where('name', inputs.name)
      .firstOrFail()
    assert.equal(project.name, inputs.name)
    assert.equal(project.category.name, inputs.type)
    assert.equal(project.difficulty, inputs.difficulty)
    assert.equal(project.sketch, inputs.sketch)
    assert.equal(project.answer, inputs.answer)
    assert.equal(project.user.id, user.id)
    assert.isFulfilled(
      fs.promises.access(`tmp/uploads/projects/${project.id}.webp`, fs.constants.F_OK)
    )
  })

  test('ensure we cannot create a project as a guest', async () => {
    const inputs = {
      name: 'Made',
      type: 'backend',
      difficulty: 'easy',
      sketch: 'https://www.figma.com/file/MPf4qYhf53RG2CDsglNlAS/Untitled',
      answer: 'https://github.com/MadeV1/API',
    }

    await supertest(BASE_URL)
      .post('/projects')
      .set('Content-Type', 'multipart/form-data')
      .field('name', inputs.name)
      .field('type', inputs.type)
      .field('difficulty', inputs.difficulty)
      .field('sketch', inputs.sketch)
      .attach('image', 'fixtures/images/project_thumbnail.webp')
      .expect(401)
  })

  test('ensure it throws a 422 error if inputs are incorrect', async () => {
    const { agent } = await actingAs()

    const inputs = {
      name: '',
      type: '',
      difficulty: '',
      sketch: '',
      answer: '',
    }

    await agent
      .post('/projects')
      .set('Content-Type', 'multipart/form-data')
      .field('name', inputs.name)
      .field('type', inputs.type)
      .field('difficulty', inputs.difficulty)
      .field('sketch', inputs.sketch)
      .attach('image', 'fixtures/images/project_thumbnail.webp')
      .expect(422)
  })
})
