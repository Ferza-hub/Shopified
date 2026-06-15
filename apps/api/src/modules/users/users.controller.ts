import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(StoreContextGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Get('members')
  @ApiOperation({ summary: 'List all members of the current store' })
  getMembers(@CurrentStore() storeId: string) {
    return this.usersService.getMembers(storeId);
  }

  @Post('members/invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite a user to the current store' })
  inviteMember(
    @CurrentStore() storeId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.usersService.inviteMember(storeId, dto);
  }

  @Patch('members/:userId')
  @ApiOperation({ summary: 'Update a member role in the current store' })
  updateMemberRole(
    @CurrentStore() storeId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.usersService.updateMemberRole(storeId, targetUserId, dto.role);
  }

  @Delete('members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the current store' })
  removeMember(
    @CurrentStore() storeId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.usersService.removeMember(storeId, targetUserId);
  }
}
