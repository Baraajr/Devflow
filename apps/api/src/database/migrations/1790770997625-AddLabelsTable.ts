import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLabelsTable1790770997625 implements MigrationInterface {
  name = 'AddLabelsTable1790770997625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "labels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "name" character varying(50) NOT NULL, "color" character varying(7) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_4ad2fb06c904bbfed6510589b2b" UNIQUE ("project_id", "name"), CONSTRAINT "PK_c0c4e97f76f1f3a268c7a70b925" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "issue_labels" ("issue_id" uuid NOT NULL, "label_id" uuid NOT NULL, CONSTRAINT "PK_1ac0a33ade1abb32c03516fa496" PRIMARY KEY ("issue_id", "label_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_68c7892926826f61d6a4a6f564" ON "issue_labels" ("issue_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0766ecbfc520efad8879ef13e" ON "issue_labels" ("label_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "labels" ADD CONSTRAINT "FK_68b0da461f6765824f6db642f12" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_labels" ADD CONSTRAINT "FK_68c7892926826f61d6a4a6f564d" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_labels" ADD CONSTRAINT "FK_b0766ecbfc520efad8879ef13e3" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "issue_labels" DROP CONSTRAINT "FK_b0766ecbfc520efad8879ef13e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_labels" DROP CONSTRAINT "FK_68c7892926826f61d6a4a6f564d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "labels" DROP CONSTRAINT "FK_68b0da461f6765824f6db642f12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0766ecbfc520efad8879ef13e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_68c7892926826f61d6a4a6f564"`,
    );
    await queryRunner.query(`DROP TABLE "issue_labels"`);
    await queryRunner.query(`DROP TABLE "labels"`);
  }
}
