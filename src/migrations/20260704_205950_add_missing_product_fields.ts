import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "barcode" varchar;
    ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "code" varchar;
    ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "brand" varchar;
    ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "cost_price_usd" numeric;
    ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "cost_price_iqd" numeric;
    ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "zone" varchar;
    ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "aisle" varchar;
    ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "shelf" varchar;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "barcode";
    ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "code";
    ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "brand";
    ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "cost_price_usd";
    ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "cost_price_iqd";
    ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "zone";
    ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "aisle";
    ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "shelf";
  `)
}
