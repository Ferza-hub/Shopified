import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { StoresModule } from './modules/stores/stores.module';
import { ProductsModule } from './modules/products/products.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { TaxModule } from './modules/tax/tax.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PagesModule } from './modules/pages/pages.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { FilesModule } from './modules/files/files.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ThemesModule } from './modules/themes/themes.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { SeoModule } from './modules/seo/seo.module';
import { SearchModule } from './modules/search/search.module';
import { StorefrontModule } from './modules/storefront/storefront.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    StoresModule,
    ProductsModule,
    CollectionsModule,
    InventoryModule,
    CustomersModule,
    OrdersModule,
    CartModule,
    CheckoutModule,
    PaymentsModule,
    DiscountsModule,
    ShippingModule,
    TaxModule,
    ReviewsModule,
    PagesModule,
    BlogsModule,
    FilesModule,
    WebhooksModule,
    AnalyticsModule,
    NotificationsModule,
    ThemesModule,
    ChannelsModule,
    SeoModule,
    SearchModule,
    StorefrontModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
