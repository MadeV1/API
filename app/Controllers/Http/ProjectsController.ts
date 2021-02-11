import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import StoreProjectValidator from 'App/Validators/StoreProjectValidator'
import Application from '@ioc:Adonis/Core/Application'
import Category from 'App/Models/Category'

export default class ProjectsController {
  public async index({ request }: HttpContextContract) {
    const projects = Project.query()

    if (request.input('category')) {
      projects.whereHas('category', (category) => category.where('name', request.input('category')))
    }

    if (request.input('difficulty')) {
      projects.where('difficulty', request.input('difficulty'))
    }

    if (request.input('name')) {
      projects.where('name', 'like', request.input('name'))
    }

    return await projects.paginate(request.input('page', 1), request.input('perPage', 5))
  }

  public async store({ request, auth }: HttpContextContract) {
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

    const image = request.file('image')
    await image?.move(Application.tmpPath('uploads/projects'), {
      name: `${project.id}.${image.extname}`,
    })

    return project.serialize()
  }

  public async show({ request }: HttpContextContract) {
    const project = await Project.query()
      .where('id', request.param('id'))
      .preload('user')
      .preload('category')
      .firstOrFail()

    return project.serialize()
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
