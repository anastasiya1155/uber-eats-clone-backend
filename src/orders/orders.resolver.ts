import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';
import { OrderService } from 'src/orders/orders.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  CreateOrderInput,
  CreateOrderOutput,
} from 'src/orders/dtos/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly ordersService: OrderService) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }
}
