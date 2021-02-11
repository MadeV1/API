import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Projects extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').unique().index()
      table.integer('category_id').unsigned().references('id').inTable('categories')
      table.string('difficulty')
      table.string('sketch').nullable()
      table.string('answer')
      table.text('body')
      table.integer('user_id').unsigned().references('id').inTable('security_users')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
