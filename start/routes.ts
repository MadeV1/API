import Route from '@ioc:Adonis/Core/Route'

Route.post('/register', 'AuthController.register').middleware('guest')
Route.post('/login', 'AuthController.login').middleware('guest')
Route.get('/me', 'AuthController.me').middleware('auth')
Route.post('/ask-new-password', 'PasswordController.ask')
Route.put('/password/reset/:user(email)', 'PasswordController.update').as('password.reset')
Route.post('/contact', 'ContactController.contact').as('contact')
Route.resource('/projects', 'ProjectsController')
  .apiOnly()
  .middleware({ store: ['auth'] })
