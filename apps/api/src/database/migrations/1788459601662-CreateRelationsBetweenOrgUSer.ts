import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRelationsBetweenOrgUSer1788459601662 implements MigrationInterface {
  name = 'CreateRelationsBetweenOrgUSer1788459601662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "PK_001dedd8721c4018f5f8167e2bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "PK_c3ac409e912dfc658c7cbe64dbc" PRIMARY KEY ("organization_id", "invited_user_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "PK_c3ac409e912dfc658c7cbe64dbc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "PK_0be9332b7ce6c2a003c87df51b1" PRIMARY KEY ("invited_user_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "PK_0be9332b7ce6c2a003c87df51b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "PK_f172f12b8a9ee6584b661f57e24" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."organization_invitations_role_enum" RENAME TO "organization_invitations_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_invitations_role_enum" AS ENUM('owner', 'developer', 'viewer')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ALTER COLUMN "role" TYPE "public"."organization_invitations_role_enum" USING "role"::"text"::"public"."organization_invitations_role_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_invitations_role_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_89bde91f78d36ca41e9515d91c6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_7062a4fbd9bab22ffd918e5d3d9" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP CONSTRAINT "FK_7062a4fbd9bab22ffd918e5d3d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP CONSTRAINT "FK_89bde91f78d36ca41e9515d91c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_invitations_role_enum_old" AS ENUM('owner', 'manager', 'developer', 'viewer')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ALTER COLUMN "role" TYPE "public"."organization_invitations_role_enum_old" USING "role"::"text"::"public"."organization_invitations_role_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ALTER COLUMN "role" SET DEFAULT 'developer'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_invitations_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."organization_invitations_role_enum_old" RENAME TO "organization_invitations_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "PK_f172f12b8a9ee6584b661f57e24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "PK_0be9332b7ce6c2a003c87df51b1" PRIMARY KEY ("invited_user_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "PK_0be9332b7ce6c2a003c87df51b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "PK_c3ac409e912dfc658c7cbe64dbc" PRIMARY KEY ("organization_id", "invited_user_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "PK_c3ac409e912dfc658c7cbe64dbc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "PK_001dedd8721c4018f5f8167e2bb" PRIMARY KEY ("organization_id", "invited_user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP COLUMN "id"`,
    );
  }
}
