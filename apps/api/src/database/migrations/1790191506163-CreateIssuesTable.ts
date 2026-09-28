import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIssuesTable1790191506163 implements MigrationInterface {
  name = 'CreateIssuesTable1790191506163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "issues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "reporter_id" uuid NOT NULL, "assignee_id" uuid, "parent_issue_id" uuid, "title" character varying(255) NOT NULL, "description" text, "issue_type" character varying(30) NOT NULL, "status" character varying(30) NOT NULL, "priority" character varying(30) NOT NULL, "issue_number" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9d8ecbbeff46229c700f0449257" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD CONSTRAINT "FK_11f35e8296e10c229e7b68c68d4" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD CONSTRAINT "FK_394a6ced54c634dfadea1618d2a" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD CONSTRAINT "FK_7da282c871a9b6497da2cecf869" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD CONSTRAINT "FK_2131eeea5547513ddb140ffa9b3" FOREIGN KEY ("parent_issue_id") REFERENCES "issues"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "issues" DROP CONSTRAINT "FK_2131eeea5547513ddb140ffa9b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" DROP CONSTRAINT "FK_7da282c871a9b6497da2cecf869"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" DROP CONSTRAINT "FK_394a6ced54c634dfadea1618d2a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" DROP CONSTRAINT "FK_11f35e8296e10c229e7b68c68d4"`,
    );
    await queryRunner.query(`DROP TABLE "issues"`);
  }
}
