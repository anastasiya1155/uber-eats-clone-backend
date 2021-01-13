import { Module } from '@nestjs/common';
import { PaymentService } from 'src/payments/payments.service';
import { PaymentsResolver } from 'src/payments/payments.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payments/entities/payment.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentService, PaymentsResolver],
})
export class PaymentsModule {}
