import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Create main case_offers table
    CREATE TABLE IF NOT EXISTS "case_offers" (
      "id" serial PRIMARY KEY,
      "slug" varchar NOT NULL,
      "featured_image_id" integer NOT NULL,
      "price" numeric NOT NULL,
      "discounted_price" numeric,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Create localized table for translation properties
    CREATE TABLE IF NOT EXISTS "case_offers_locales" (
      "id" serial PRIMARY KEY,
      "parent_id" integer NOT NULL,
      "locale" varchar NOT NULL,
      "title" varchar NOT NULL,
      "description" jsonb,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "case_offers_locales_locale_parent_unique" UNIQUE("locale", "parent_id")
    );

    -- Add foreign key constraint to link locales back to parent case_offers safely
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'case_offers_locales_parent_id_fk'
      ) THEN
        ALTER TABLE "case_offers_locales" 
          ADD CONSTRAINT "case_offers_locales_parent_id_fk" 
          FOREIGN KEY ("parent_id") 
          REFERENCES "case_offers"("id") 
          ON DELETE cascade;
      END IF;
    END $$;

    -- Add foreign key constraint ONLY IF media table exists
    DO $$ 
    BEGIN
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'media') THEN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'case_offers_featured_image_id_fk'
        ) THEN
          ALTER TABLE "case_offers" 
            ADD CONSTRAINT "case_offers_featured_image_id_fk" 
            FOREIGN KEY ("featured_image_id") 
            REFERENCES "media"("id") 
            ON DELETE restrict;
        END IF;
      END IF;
    END $$;
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP TABLE IF EXISTS "case_offers_locales";
    DROP TABLE IF EXISTS "case_offers";
  `)
}
