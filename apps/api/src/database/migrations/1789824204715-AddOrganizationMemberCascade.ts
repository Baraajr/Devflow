import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationMemberCascade1789824204715 implements MigrationInterface {
  name = 'AddOrganizationMemberCascade1789824204715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP CONSTRAINT "FK_7062a4fbd9bab22ffd918e5d3d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_7062a4fbd9bab22ffd918e5d3d9" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_members" DROP CONSTRAINT "FK_7062a4fbd9bab22ffd918e5d3d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_7062a4fbd9bab22ffd918e5d3d9" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
