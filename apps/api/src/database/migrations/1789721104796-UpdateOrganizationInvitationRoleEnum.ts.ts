import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1789721104796 implements MigrationInterface {
  name = ' $npmConfigName1789721104796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."organization_invitations_role_enum" RENAME TO "organization_invitations_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_invitations_role_enum" AS ENUM('manager', 'MANAGER', 'developer', 'DEVELOPER', 'viewer', 'VIEWER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ALTER COLUMN "role" TYPE "public"."organization_invitations_role_enum" USING "role"::"text"::"public"."organization_invitations_role_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_invitations_role_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organization_invitations_role_enum_old" AS ENUM('owner', 'developer', 'viewer')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ALTER COLUMN "role" TYPE "public"."organization_invitations_role_enum_old" USING "role"::"text"::"public"."organization_invitations_role_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_invitations_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."organization_invitations_role_enum_old" RENAME TO "organization_invitations_role_enum"`,
    );
  }
}
