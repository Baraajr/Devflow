import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationInvitations1788430923171 implements MigrationInterface {
  name = 'AddOrganizationInvitations1788430923171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organization_invitations_status_enum" AS ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_invitations_role_enum" AS ENUM('owner', 'manager', 'developer', 'viewer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_invitations" ("organization_id" uuid NOT NULL, "invited_user_id" uuid NOT NULL, "invited_by" uuid NOT NULL, "status" "public"."organization_invitations_status_enum" NOT NULL DEFAULT 'pending', "role" "public"."organization_invitations_role_enum" NOT NULL DEFAULT 'developer', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_001dedd8721c4018f5f8167e2bb" PRIMARY KEY ("organization_id", "invited_user_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_invitations"`);
    await queryRunner.query(
      `DROP TYPE "public"."organization_invitations_role_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_invitations_status_enum"`,
    );
  }
}
