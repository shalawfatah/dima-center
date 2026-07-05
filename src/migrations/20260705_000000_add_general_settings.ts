import { sql } from 'drizzle-orm'

export const up = async ({ payload }: { payload: any; req: any }): Promise<void> => {
  await payload.db.drizzle.execute(sql`
    CREATE TYPE "public"."enum_general_settings_socials_platform" AS ENUM('facebook', 'instagram', 'tiktok', 'whatsapp', 'linkedin');

    CREATE TABLE "general_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "logo_id" integer,
        "exchange_rate" numeric DEFAULT 1500 NOT NULL,
        "email" varchar,
        "phone" varchar,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "general_settings_socials" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "platform" "enum_general_settings_socials_platform" NOT NULL,
        "url" varchar NOT NULL
    );

    CREATE TABLE "general_settings_locales" (
        "slogan" varchar,
        "address" varchar,
        "id" serial PRIMARY KEY NOT NULL,
        "_locale" "_locales" NOT NULL,
        "_parent_id" integer NOT NULL
    );

    ALTER TABLE "general_settings_socials" ADD CONSTRAINT "general_settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."general_settings"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "general_settings_locales" ADD CONSTRAINT "general_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."general_settings"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "general_settings_socials_order_idx" ON "general_settings_socials" USING btree ("_order");
    CREATE INDEX "general_settings_socials_parent_id_idx" ON "general_settings_socials" USING btree ("_parent_id");
    CREATE INDEX "general_settings_logo_idx" ON "general_settings" USING btree ("logo_id");
    CREATE UNIQUE INDEX "general_settings_locales_locale_parent_id_unique" ON "general_settings_locales" USING btree ("_locale", "_parent_id");
  `)
}

export const down = async ({ payload }: { payload: any; req: any }): Promise<void> => {
  await payload.db.drizzle.execute(sql`
    DROP TABLE "general_settings_locales";
    DROP TABLE "general_settings_socials";
    DROP TABLE "general_settings";
    DROP TYPE "public"."enum_general_settings_socials_platform";
  `)
}
