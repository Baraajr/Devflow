import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIssueEnums1790430807479 implements MigrationInterface {
    name = 'AddIssueEnums1790430807479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_type"`);
        await queryRunner.query(`CREATE TYPE "public"."issues_issue_type_enum" AS ENUM('task', 'bug', 'story', 'epic')`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "issue_type" "public"."issues_issue_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."issues_status_enum" AS ENUM('todo', 'in_progress', 'done')`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "status" "public"."issues_status_enum" NOT NULL DEFAULT 'todo'`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "priority"`);
        await queryRunner.query(`CREATE TYPE "public"."issues_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "priority" "public"."issues_priority_enum" NOT NULL DEFAULT 'medium'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."issues_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "priority" character varying(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."issues_status_enum"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "status" character varying(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "issue_type"`);
        await queryRunner.query(`DROP TYPE "public"."issues_issue_type_enum"`);
        await queryRunner.query(`ALTER TABLE "issues" ADD "issue_type" character varying(30) NOT NULL`);
    }

}
