import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Deliberately empty baseline to bypass the collision crash
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Deliberately empty
}
