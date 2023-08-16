import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import SecurityUser from './SecurityUser'
import Category from './Category'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public name: string

  @column()
  public categoryId: number

  @belongsTo(() => Category, {
    foreignKey: 'categoryId',
  })
  public category: BelongsTo<typeof Category>

  @column()
  public difficulty: string

  @column()
  public sketch: string

  @column()
  public answer: string

  @column()
  public body: string

  @column()
  public userId: number

  @belongsTo(() => SecurityUser, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof SecurityUser>
}
