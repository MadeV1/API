import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import StoreProjectValidator from 'App/Validators/StoreProjectValidator'
import Application from '@ioc:Adonis/Core/Application'
import Category from 'App/Models/Category'

export default class ProjectsController {
  public async index({ request }: HttpContextContract) {
    const projects = Project.query()

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
    await project.related('category').associate(category)
    await project.related('user').associate(auth.user)

    const image = request.file('image')
    await image?.move(Application.tmpPath('uploads/projects'), {
      name: `${project.id}.${image.extname}`,
    })

    return project
  }

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
