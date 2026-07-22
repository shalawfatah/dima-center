import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "promotions_locales" CASCADE;
   DROP TABLE IF EXISTS "promotions" CASCADE;
   DROP TABLE IF EXISTS "case_offers_locales" CASCADE;
   DROP TABLE IF EXISTS "case_offers" CASCADE;

   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_promotions_fk";
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_case_offers_fk";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "promotions_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "case_offers_id";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Migration down logic (optional)
}
