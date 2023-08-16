import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import StoreProjectValidator from 'App/Validators/StoreProjectValidator'
import Category from 'App/Models/Category'
import { ray } from 'node-ray'

export default class ProjectsController {
  public async index({ request }: HttpContextContract) {
    const query = Project.query()

    if (request.input('category')) {
      query.whereHas('category', (category) => category.where('name', request.input('category')))
    }

    if (request.input('difficulty')) {
      query.where('difficulty', request.input('difficulty'))
    }

    if (request.input('name')) {
      query.where('name', 'like', request.input('name'))
    }

    const projects = await query
      .preload('category')
      .paginate(request.input('page', 1), request.input('perPage', 5))

    return projects
  }

  public async store({ request, auth, response }: HttpContextContract) {
    if (!auth.user) return

    const projectDetails = await request.validate(StoreProjectValidator)

    const category = await Category.findByOrFail('name', projectDetails.type)

    const project = new Project()
    project.name = projectDetails.name
    project.difficulty = projectDetails.difficulty
    project.sketch = projectDetails.sketch
    project.answer = projectDetails.answer
    project.body = projectDetails.body
    await project.related('category').associate(category)
    await project.related('user').associate(auth.user)

    projectDetails.image.moveToDisk(
      'uploads/projects',
      {
        name: `${project.id}.${projectDetails.image.extname}`,
      },
      's3'
    )

    return response.created(project.serialize())
  }

  public async show({ request }: HttpContextContract) {
    const project = await Project.query()
      .where('id', request.param('id'))
      .preload('user')
      .preload('category')
      .firstOrFail()

    ray(project.serialize())

    return project.serialize()
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
