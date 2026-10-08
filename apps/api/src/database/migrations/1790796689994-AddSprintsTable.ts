import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSprintsTable1790796689994 implements MigrationInterface {
    name = 'AddSprintsTable1790796689994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sprints_status_enum" AS ENUM('planned', 'active', 'completed')`);
        await queryRunner.query(`CREATE TABLE "sprints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "goal" text, "status" "public"."sprints_status_enum" NOT NULL DEFAULT 'planned', "startDate" date, "endDate" date, "projectId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6800aa2e0f508561812c4b9afb4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sprints"`);
        await queryRunner.query(`DROP TYPE "public"."sprints_status_enum"`);
    }

}
