import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsEnum } from 'class-validator';

import { InvitableOrganizationRole } from '../../organization/enums/invitable-organization-role.enum';

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'john@example.com',
  })
  @IsEmail()
  invitedUserEmail: string;

  @ApiProperty({
    description: 'Role assigned to the invited user',
    enum: InvitableOrganizationRole,
    example: InvitableOrganizationRole.DEVELOPER,
  })
  @Transform(({ value }: TransformFnParams) => String(value).toLowerCase())
  @IsEnum(InvitableOrganizationRole, {
    message: 'Invalid organization role',
  })
  role: InvitableOrganizationRole;
}
