import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationTables1788202691075 implements MigrationInterface {
  name = 'AddOrganizationTables1788202691075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organization_members_role_enum" AS ENUM('owner', 'manager', 'developer', 'viewer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_members" ("organization_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" "public"."organization_members_role_enum" NOT NULL DEFAULT 'developer', "joined_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4812f00736e35131a65d6032da" PRIMARY KEY ("organization_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "slug" character varying(150) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_963693341bd612aa01ddf3a4b68" UNIQUE ("slug"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TABLE "organization_members"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_members_role_enum"`,
    );
  }
}
