import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'
import StoreProjectValidator from 'App/Validators/StoreProjectValidator'
import Application from '@ioc:Adonis/Core/Application'

export default class ProjectsController {
  public async index({}: HttpContextContract) {}

  public async store({ request, auth }: HttpContextContract) {
    if (!auth.user) return

    const projectDetails = await request.validate(StoreProjectValidator)

    const project = new Project()
    project.name = projectDetails.name
    project.type = projectDetails.type
    project.difficulty = projectDetails.difficulty
    project.sketch = projectDetails.sketch
    project.answer = projectDetails.answer
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
