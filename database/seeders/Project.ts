import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { ProjectFactory } from 'Database/factories'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await ProjectFactory.createMany(18)
  }
}
