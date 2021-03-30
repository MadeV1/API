import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class SecurityUser extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public pseudonym: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public job: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(securityUser: SecurityUser) {
    if (securityUser.$dirty.password) {
      securityUser.password = await Hash.make(securityUser.password)
    }
  }
}
