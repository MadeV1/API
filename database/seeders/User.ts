import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import SecurityUser from 'App/Models/SecurityUser'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await SecurityUser.createMany([
      {
        email: 'alexandre-gerault@made-tp.fr',
        password: 'secret',
        pseudonym: 'Alexandre Gérault',
      },
      {
        email: 'mickael-ferri@made-tp.fr',
        password: 'secret',
        pseudonym: 'Micka',
      },
    ])
  }
}
