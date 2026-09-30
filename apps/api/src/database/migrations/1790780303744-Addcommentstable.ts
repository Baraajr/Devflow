import { MigrationInterface, QueryRunner } from "typeorm";

export class Addcommentstable1790780303744 implements MigrationInterface {
    name = 'Addcommentstable1790780303744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "issue_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issue_id" uuid NOT NULL, "author_id" uuid NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c650a2d6817045a0c8ce74f09f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "issue_comments" ADD CONSTRAINT "FK_5031938a085cb5bea6ed4eaeb53" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_comments" ADD CONSTRAINT "FK_d13ed944b24d63df64da10e4378" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issue_comments" DROP CONSTRAINT "FK_d13ed944b24d63df64da10e4378"`);
        await queryRunner.query(`ALTER TABLE "issue_comments" DROP CONSTRAINT "FK_5031938a085cb5bea6ed4eaeb53"`);
        await queryRunner.query(`DROP TABLE "issue_comments"`);
    }

}
