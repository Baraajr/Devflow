import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1790014003000 implements MigrationInterface {
  name = ' $npmConfigName1790014003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_members" ("project_id" uuid NOT NULL, "user_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "role" character varying(30) NOT NULL DEFAULT 'developer', "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b3f491d3a3f986106d281d8eb4b" PRIMARY KEY ("project_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e89aae80e010c2faa72e6a49ce" ON "project_members" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9bd160223c5bafd977c0b9340d" ON "project_members" ("organization_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_68a8c9a0850fd351ce386e343a" ON "project_members" ("organization_id", "project_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "key" character varying(20) NOT NULL, "slug" character varying(150) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9e19e6e534ee8bc908e801e5d3" ON "projects" ("organization_id", "slug") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_01d222d365faac1a1c8a7a0871" ON "projects" ("organization_id", "key") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_298cd09a3e23249c9fa1bb250d" ON "projects" ("organization_id", "id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_b5729113570c20c7e214cf3f58d" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_e89aae80e010c2faa72e6a49ce8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_585c8ce06628c70b70100bfb842" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_585c8ce06628c70b70100bfb842"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "FK_e89aae80e010c2faa72e6a49ce8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "FK_b5729113570c20c7e214cf3f58d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_298cd09a3e23249c9fa1bb250d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_01d222d365faac1a1c8a7a0871"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9e19e6e534ee8bc908e801e5d3"`,
    );
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_68a8c9a0850fd351ce386e343a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9bd160223c5bafd977c0b9340d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e89aae80e010c2faa72e6a49ce"`,
    );
    await queryRunner.query(`DROP TABLE "project_members"`);
  }
}
