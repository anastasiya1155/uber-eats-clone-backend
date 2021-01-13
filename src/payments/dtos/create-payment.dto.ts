import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Payment } from 'src/payments/entities/payment.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionId',
  'restaurantId',
]) {}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}
