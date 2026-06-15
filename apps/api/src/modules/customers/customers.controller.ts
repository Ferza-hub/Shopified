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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers with pagination and search' })
  findAll(
    @CurrentStore() storeId: string,
    @Query() query: CustomerQueryDto,
  ) {
    return this.customersService.findAll(storeId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  create(
    @CurrentStore() storeId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(storeId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer with addresses and order stats' })
  findOne(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  update(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(storeId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate customer (set isActive=false)' })
  deactivate(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.deactivate(storeId, id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get orders for a customer' })
  getOrders(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.getOrders(storeId, id);
  }

  @Post(':id/addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add address to customer' })
  addAddress(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.customersService.addAddress(storeId, id, dto);
  }

  @Patch(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Update customer address' })
  updateAddress(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.customersService.updateAddress(storeId, id, addressId, dto);
  }

  @Delete(':id/addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer address' })
  deleteAddress(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    return this.customersService.deleteAddress(storeId, id, addressId);
  }

  @Patch(':id/addresses/:addressId/default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefaultAddress(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    return this.customersService.setDefaultAddress(storeId, id, addressId);
  }
}
