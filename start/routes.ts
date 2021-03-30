/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.post('/register', 'AuthController.register').middleware('guest')
Route.post('/login', 'AuthController.login').middleware('guest')
Route.get('/me', 'AuthController.me').middleware('auth')
Route.post('/ask-new-password', 'PasswordController.ask')
Route.put('/password/reset/:email', 'PasswordController.update').as('password.reset')
Route.post('/contact', 'ContactController.contact').as('contact')
Route.resource('/projects', 'ProjectsController')
  .apiOnly()
  .middleware({ store: ['auth'] })
