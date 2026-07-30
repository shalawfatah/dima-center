import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ckb', 'en', 'ar');
  CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'admin', 'customer');
  CREATE TYPE "public"."enum_products_condition" AS ENUM('new', 'used', 'refurbished', 'open_box', 'used_like_new', 'used_no_box');
  CREATE TYPE "public"."enum_products_discount_type" AS ENUM('fixed', 'percentage');
  CREATE TYPE "public"."enum_ui_products_link_type" AS ENUM('none', 'product', 'static');
  CREATE TYPE "public"."enum_events_text_color" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_events_banner_height" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_events_media_type" AS ENUM('image', 'svg', 'video');
  CREATE TYPE "public"."enum_general_settings_socials_platform" AS ENUM('facebook', 'instagram', 'tiktok', 'whatsapp', 'linkedin');
  CREATE TYPE "public"."enum_general_settings_navbar_width" AS ENUM('full', 'fit-content');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'customer' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "products_technical_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "products_technical_specs_locales" (
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "products_images_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"barcode" varchar,
  	"code" varchar,
  	"brand" varchar,
  	"price" numeric NOT NULL,
  	"price_i_q_d" numeric,
  	"stock" numeric DEFAULT 0 NOT NULL,
  	"condition" "enum_products_condition" NOT NULL,
  	"category_id" integer NOT NULL,
  	"has_discount" boolean DEFAULT false,
  	"discount_type" "enum_products_discount_type" DEFAULT 'fixed',
  	"discount_value" numeric,
  	"featured_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ui_categories_sub_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar
  );
  
  CREATE TABLE "ui_categories_sub_categories_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "ui_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"is_container" boolean DEFAULT false,
  	"hide_in_carousel" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ui_categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ui_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"price" numeric,
  	"image_id" integer,
  	"ui_category_id" integer NOT NULL,
  	"category_id" integer,
  	"link_type" "enum_ui_products_link_type" DEFAULT 'none',
  	"linked_product_id" integer,
  	"static_url" varchar,
  	"order" numeric DEFAULT 0,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ui_products_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"text_color" "enum_events_text_color" DEFAULT 'light',
  	"banner_height" "enum_events_banner_height" DEFAULT 'medium' NOT NULL,
  	"media_type" "enum_events_media_type" DEFAULT 'image' NOT NULL,
  	"background_image_id" integer,
  	"background_svg" varchar,
  	"background_video_id" integer,
  	"enable_link" boolean DEFAULT false,
  	"link_url" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"products_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"ui_categories_id" integer,
  	"ui_products_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
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
  
  CREATE TABLE "general_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"logo_background_color" varchar DEFAULT 'transparent',
  	"site_background_background_color" varchar DEFAULT '#ffffff',
  	"typography_kurdish_heading_font_id" integer,
  	"typography_kurdish_body_font_id" integer,
  	"typography_arabic_heading_font_id" integer,
  	"typography_arabic_body_font_id" integer,
  	"typography_english_heading_font_id" integer,
  	"typography_english_body_font_id" integer,
  	"pc_builder_background_image_id" integer,
  	"pc_builder_foreground_image_id" integer,
  	"header_background_color" varchar,
  	"header_event_logo_sticker_id" integer,
  	"navbar_width" "enum_general_settings_navbar_width" DEFAULT 'full',
  	"navbar_background_color" varchar,
  	"navbar_text_color" varchar,
  	"exchange_rate" numeric DEFAULT 1500 NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "general_settings_locales" (
  	"slogan" varchar,
  	"address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_technical_specs" ADD CONSTRAINT "products_technical_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_technical_specs_locales" ADD CONSTRAINT "products_technical_specs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_technical_specs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_images_gallery" ADD CONSTRAINT "products_images_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images_gallery" ADD CONSTRAINT "products_images_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ui_categories_sub_categories" ADD CONSTRAINT "ui_categories_sub_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ui_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ui_categories_sub_categories_locales" ADD CONSTRAINT "ui_categories_sub_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ui_categories_sub_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ui_categories_locales" ADD CONSTRAINT "ui_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ui_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ui_products" ADD CONSTRAINT "ui_products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ui_products" ADD CONSTRAINT "ui_products_ui_category_id_ui_categories_id_fk" FOREIGN KEY ("ui_category_id") REFERENCES "public"."ui_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ui_products" ADD CONSTRAINT "ui_products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ui_products" ADD CONSTRAINT "ui_products_linked_product_id_products_id_fk" FOREIGN KEY ("linked_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ui_products_locales" ADD CONSTRAINT "ui_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ui_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ui_categories_fk" FOREIGN KEY ("ui_categories_id") REFERENCES "public"."ui_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ui_products_fk" FOREIGN KEY ("ui_products_id") REFERENCES "public"."ui_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "general_settings_socials" ADD CONSTRAINT "general_settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."general_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_typography_kurdish_heading_font_id_media_id_fk" FOREIGN KEY ("typography_kurdish_heading_font_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_typography_kurdish_body_font_id_media_id_fk" FOREIGN KEY ("typography_kurdish_body_font_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_typography_arabic_heading_font_id_media_id_fk" FOREIGN KEY ("typography_arabic_heading_font_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_typography_arabic_body_font_id_media_id_fk" FOREIGN KEY ("typography_arabic_body_font_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_typography_english_heading_font_id_media_id_fk" FOREIGN KEY ("typography_english_heading_font_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_typography_english_body_font_id_media_id_fk" FOREIGN KEY ("typography_english_body_font_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_pc_builder_background_image_id_media_id_fk" FOREIGN KEY ("pc_builder_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_pc_builder_foreground_image_id_media_id_fk" FOREIGN KEY ("pc_builder_foreground_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_header_event_logo_sticker_id_media_id_fk" FOREIGN KEY ("header_event_logo_sticker_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "general_settings_locales" ADD CONSTRAINT "general_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."general_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "products_technical_specs_order_idx" ON "products_technical_specs" USING btree ("_order");
  CREATE INDEX "products_technical_specs_parent_id_idx" ON "products_technical_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_technical_specs_locales_locale_parent_id_unique" ON "products_technical_specs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_images_gallery_order_idx" ON "products_images_gallery" USING btree ("_order");
  CREATE INDEX "products_images_gallery_parent_id_idx" ON "products_images_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_images_gallery_image_idx" ON "products_images_gallery" USING btree ("image_id");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_featured_image_idx" ON "products" USING btree ("featured_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ui_categories_sub_categories_order_idx" ON "ui_categories_sub_categories" USING btree ("_order");
  CREATE INDEX "ui_categories_sub_categories_parent_id_idx" ON "ui_categories_sub_categories" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ui_categories_sub_categories_locales_locale_parent_id_unique" ON "ui_categories_sub_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ui_categories_updated_at_idx" ON "ui_categories" USING btree ("updated_at");
  CREATE INDEX "ui_categories_created_at_idx" ON "ui_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "ui_categories_locales_locale_parent_id_unique" ON "ui_categories_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "ui_products_slug_idx" ON "ui_products" USING btree ("slug");
  CREATE INDEX "ui_products_image_idx" ON "ui_products" USING btree ("image_id");
  CREATE INDEX "ui_products_ui_category_idx" ON "ui_products" USING btree ("ui_category_id");
  CREATE INDEX "ui_products_category_idx" ON "ui_products" USING btree ("category_id");
  CREATE INDEX "ui_products_linked_product_idx" ON "ui_products" USING btree ("linked_product_id");
  CREATE INDEX "ui_products_updated_at_idx" ON "ui_products" USING btree ("updated_at");
  CREATE INDEX "ui_products_created_at_idx" ON "ui_products" USING btree ("created_at");
  CREATE UNIQUE INDEX "ui_products_locales_locale_parent_id_unique" ON "ui_products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_background_image_idx" ON "events" USING btree ("background_image_id");
  CREATE INDEX "events_background_video_idx" ON "events" USING btree ("background_video_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_ui_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("ui_categories_id");
  CREATE INDEX "payload_locked_documents_rels_ui_products_id_idx" ON "payload_locked_documents_rels" USING btree ("ui_products_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "general_settings_socials_order_idx" ON "general_settings_socials" USING btree ("_order");
  CREATE INDEX "general_settings_socials_parent_id_idx" ON "general_settings_socials" USING btree ("_parent_id");
  CREATE INDEX "general_settings_logo_idx" ON "general_settings" USING btree ("logo_id");
  CREATE INDEX "general_settings_typography_kurdish_typography_kurdish_h_idx" ON "general_settings" USING btree ("typography_kurdish_heading_font_id");
  CREATE INDEX "general_settings_typography_kurdish_typography_kurdish_b_idx" ON "general_settings" USING btree ("typography_kurdish_body_font_id");
  CREATE INDEX "general_settings_typography_arabic_typography_arabic_hea_idx" ON "general_settings" USING btree ("typography_arabic_heading_font_id");
  CREATE INDEX "general_settings_typography_arabic_typography_arabic_bod_idx" ON "general_settings" USING btree ("typography_arabic_body_font_id");
  CREATE INDEX "general_settings_typography_english_typography_english_h_idx" ON "general_settings" USING btree ("typography_english_heading_font_id");
  CREATE INDEX "general_settings_typography_english_typography_english_b_idx" ON "general_settings" USING btree ("typography_english_body_font_id");
  CREATE INDEX "general_settings_pc_builder_pc_builder_background_image_idx" ON "general_settings" USING btree ("pc_builder_background_image_id");
  CREATE INDEX "general_settings_pc_builder_pc_builder_foreground_image_idx" ON "general_settings" USING btree ("pc_builder_foreground_image_id");
  CREATE INDEX "general_settings_header_header_event_logo_sticker_idx" ON "general_settings" USING btree ("header_event_logo_sticker_id");
  CREATE UNIQUE INDEX "general_settings_locales_locale_parent_id_unique" ON "general_settings_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "products_technical_specs" CASCADE;
  DROP TABLE "products_technical_specs_locales" CASCADE;
  DROP TABLE "products_images_gallery" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "ui_categories_sub_categories" CASCADE;
  DROP TABLE "ui_categories_sub_categories_locales" CASCADE;
  DROP TABLE "ui_categories" CASCADE;
  DROP TABLE "ui_categories_locales" CASCADE;
  DROP TABLE "ui_products" CASCADE;
  DROP TABLE "ui_products_locales" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "general_settings_socials" CASCADE;
  DROP TABLE "general_settings" CASCADE;
  DROP TABLE "general_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_products_condition";
  DROP TYPE "public"."enum_products_discount_type";
  DROP TYPE "public"."enum_ui_products_link_type";
  DROP TYPE "public"."enum_events_text_color";
  DROP TYPE "public"."enum_events_banner_height";
  DROP TYPE "public"."enum_events_media_type";
  DROP TYPE "public"."enum_general_settings_socials_platform";
  DROP TYPE "public"."enum_general_settings_navbar_width";`)
}
