import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvitationForeignKeys1789991297128 implements MigrationInterface {
  name = 'AddInvitationForeignKeys1789991297128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "FK_8510c6828ceb2df38a00f252cb3" FOREIGN KEY ("invited_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" ADD CONSTRAINT "FK_7f88954e8d667a76ae3ced6f446" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "FK_7f88954e8d667a76ae3ced6f446"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_invitations" DROP CONSTRAINT "FK_8510c6828ceb2df38a00f252cb3"`,
    );
  }
}
