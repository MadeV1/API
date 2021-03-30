import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SecurityUsersSchema extends BaseSchema {
  protected tableName = 'security_users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('pseudonym', 255).notNullable().unique().index()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.string('job').nullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
