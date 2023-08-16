import Database from '@ioc:Adonis/Lucid/Database'
import Project from 'App/Models/Project'
import { ProjectFactory } from 'Database/factories'
import Category from 'App/Models/Category'
import { test } from '@japa/runner'
import SecurityUser from 'App/Models/SecurityUser'
import Drive from '@ioc:Adonis/Core/Drive'
import { file } from '@ioc:Adonis/Core/Helpers'

test.group('Project tests', (group) => {
  group.setup(async () => {
    const categories: string[] = ['frontend', 'backend', 'fullstack']
    categories.forEach(async (categoryName) => {
      const category = new Category()
      category.name = categoryName
      await category.save()
    })
  })

  group.teardown(async () => {
    const categories = await Category.all()
    categories.forEach(async (category) => await category.delete())
  })

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  /* Project index */
  test('ensure it list last 5 projects by default', async ({ client, assert }) => {
    await ProjectFactory.createMany(5)

    const response = await client.get('/projects').send()

    const body = response.body()

    assert.lengthOf(body.data, 5)
  })

  test('ensure it list the specified amount of project', async ({ assert, client }) => {
    await ProjectFactory.createMany(20)

    const response = await client.get('/projects?perPage=10').send()

    const body = response.body()

    assert.lengthOf(body.data, 10)
  })

  test('ensure it can filter projects by category', async ({ assert, client }) => {
    await ProjectFactory.merge({ categoryId: 1 }).createMany(5)
    await ProjectFactory.merge({ categoryId: 2 }).createMany(5)
    await ProjectFactory.merge({ categoryId: 3 }).createMany(5)

    const response = await client.get('/projects?perPage=10&category=frontend').send()

    const body = response.body()

    assert.lengthOf(body.data, 5)
  })

  test('ensure it can filter projects by difficulty', async ({ assert, client }) => {
    await ProjectFactory.merge({ difficulty: 'easy' }).createMany(5)
    await ProjectFactory.merge({ difficulty: 'medium' }).createMany(5)
    await ProjectFactory.merge({ difficulty: 'hard' }).createMany(5)

    const response = await client.get('/projects?perPage=10&difficulty=easy').send()

    const body = response.body()

    assert.lengthOf(body.data, 5)
  })

  test('ensure it can filter projects by name', async ({ assert, client }) => {
    await ProjectFactory.merge({ name: 'Made' }).create()
    await ProjectFactory.createMany(10)

    const response = await client.get('/projects?perPage=10&name=made').send()

    const body = response.body()

    assert.lengthOf(body.data, 1)
    assert.equal(body.data[0].name, 'Made')
  })

  /* Project creation */
  test('ensure we can create a projet with valid input if we are logged', async ({
    assert,
    client,
  }) => {
    Drive.fake('s3')

    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()

    const avatar = await file.generatePng('1mb', 'avatar.png')

    const inputs = {
      name: 'Made',
      type: 'backend',
      difficulty: 'easy',
      sketch: 'https://www.figma.com/file/MPf4qYhf53RG2CDsglNlAS/Untitled',
      answer: 'https://www.github.com/MadeV1/API',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a tincidunt augue. Nunc mollis, mi id placerat aliquet, nunc lorem aliquet lectus, quis fringilla sapien diam sed eros. Nam metus metus, finibus vitae mauris ac, fermentum ultricies ipsum.',
    }

    const response = await client
      .post('/projects')
      .loginAs(user)
      .fields(inputs)
      .file('image', avatar.contents, { filename: avatar.name })

    response.assertStatus(201)

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
    assert.equal(project.body, inputs.body)
    assert.equal(project.user.id, user.id)
    // assert.isTrue(await drive.exists(`uploads/projects/${project.id}.png`))
  })

  test('ensure we cannot create a project as a guest', async ({ client }) => {
    const avatar = await file.generatePng('1mb', 'avatar.png')

    const inputs = {
      name: 'Made',
      type: 'backend',
      difficulty: 'easy',
      sketch: 'https://www.figma.com/file/MPf4qYhf53RG2CDsglNlAS/Untitled',
      answer: 'https://github.com/MadeV1/API',
    }

    const response = await client
      .post('/projects')
      .fields(inputs)
      .file('image', avatar.contents, { filename: avatar.name })

    response.assertStatus(401)
  })

  test('ensure it throws a 422 error if inputs are incorrect', async ({ client }) => {
    const user = new SecurityUser()
    user.pseudonym = 'Romain Lanz'
    user.email = 'romain.lanz@hey.com'
    user.password = 'secret'
    await user.save()

    const avatar = await file.generatePng('1mb', 'avatar.png')

    const inputs = {
      name: '',
      type: '',
      difficulty: '',
      sketch: '',
      answer: '',
    }

    const response = await client
      .post('/projects')
      .loginAs(user)
      .fields(inputs)
      .file('image', avatar.contents, { filename: avatar.name })

    response.assertStatus(422)
  })

  /* Project read */
  test('ensure it can show a project', async ({ client }) => {
    const project = await ProjectFactory.with('user')
      .with('category', 1, (category) => category.merge({ name: 'temp' }))
      .create()

    const response = await client.get(`/projects/${project.id}`).send()

    response.assertStatus(200)
  })

  test('ensure it send a 404 response if no model is found', async ({ client }) => {
    const response = await client.get('/projects/1').send()

    response.assertStatus(404)
  })

  test('ensure it load category and user relationships', async ({ assert, client }) => {
    const project = await ProjectFactory.with('user')
      .with('category', 1, (category) => category.merge({ name: 'temp' }))
      .create()
    await project.user.refresh()
    await project.category.refresh()

    const response = await client.get(`/projects/${project.id}`).send()

    assert.deepEqual(response.body().user, project.user.serialize())
    assert.deepEqual(response.body().category, project.category.serialize())
  })
})
