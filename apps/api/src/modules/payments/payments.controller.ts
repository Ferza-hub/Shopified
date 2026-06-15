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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all payments for the store' })
  findAll(@CurrentStore() storeId: string) {
    return this.paymentsService.findAll(storeId);
  }

  @Get('gateways')
  @ApiOperation({ summary: 'List configured payment gateways' })
  listGateways(@CurrentStore() storeId: string) {
    return this.paymentsService.listGateways(storeId);
  }

  @Post('gateways')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create/configure a payment gateway' })
  createGateway(
    @CurrentStore() storeId: string,
    @Body() dto: CreateGatewayDto,
  ) {
    return this.paymentsService.createGateway(storeId, dto);
  }

  @Patch('gateways/:id')
  @ApiOperation({ summary: 'Update payment gateway configuration' })
  updateGateway(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGatewayDto,
  ) {
    return this.paymentsService.updateGateway(storeId, id, dto);
  }

  @Delete('gateways/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disable a payment gateway' })
  deleteGateway(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.paymentsService.deleteGateway(storeId, id);
  }

  @Post('process')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process a payment for an order' })
  processPayment(
    @CurrentStore() storeId: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(storeId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  findOne(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.paymentsService.findOne(storeId, id);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Refund a payment' })
  refundPayment(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentsService.refundPayment(storeId, id, dto);
  }
}
