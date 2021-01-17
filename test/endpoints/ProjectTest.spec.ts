import Database from '@ioc:Adonis/Lucid/Database'
import Project from 'App/Models/Project'
import SecurityUser from 'App/Models/SecurityUser'
import test from 'japa'
import supertest from 'supertest'
import fs from 'fs'
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

test.group('Project tests', (group) => {
  group.beforeEach(async () => {
    console.log('[PROJECTS] Start DB transaction')
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    console.log('[PROJECTS] Rollback DB transaction')
    await Database.rollbackGlobalTransaction()
  })

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

    const project = await Project.findByOrFail('name', inputs.name)
    assert.equal(project.name, inputs.name)
    assert.equal(project.type, inputs.type)
    assert.equal(project.difficulty, inputs.difficulty)
    assert.equal(project.sketch, inputs.sketch)
    assert.equal(project.answer, inputs.answer)
    assert.equal(project.userId, user.id)
    assert.isFulfilled(fs.promises.access(`tmp/uploads/projects/${project.id}.webp`, fs.constants.F_OK))
  )

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
