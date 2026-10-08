import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSprintToIssue1790797729914 implements MigrationInterface {
    name = 'AddSprintToIssue1790797729914'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" ADD "sprintId" uuid`);
        await queryRunner.query(`ALTER TABLE "issues" ADD CONSTRAINT "FK_aed680c6a19809d2cca92f6d41e" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issues" DROP CONSTRAINT "FK_aed680c6a19809d2cca92f6d41e"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "sprintId"`);
    }

}
