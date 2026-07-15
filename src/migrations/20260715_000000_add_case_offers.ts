export async function up({ payload }: { payload: any }): Promise<void> {
  await payload.db.drizzle.execute(`
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

    -- Add foreign key constraint to link locales back to parent case_offers
    ALTER TABLE "case_offers_locales" 
      ADD CONSTRAINT "case_offers_locales_parent_id_fk" 
      FOREIGN KEY ("parent_id") 
      REFERENCES "case_offers"("id") 
      ON DELETE cascade;

    -- Add foreign key constraint linking to your existing media table
    ALTER TABLE "case_offers" 
      ADD CONSTRAINT "case_offers_featured_image_id_fk" 
      FOREIGN KEY ("featured_image_id") 
      REFERENCES "media"("id") 
      ON DELETE restrict;
  `)
}

export async function down({ payload }: { payload: any }): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP TABLE IF EXISTS "case_offers_locales" CASCADE;
    DROP TABLE IF EXISTS "case_offers" CASCADE;
  `)
}
