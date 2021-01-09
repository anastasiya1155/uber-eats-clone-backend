import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';
import { OrderService } from 'src/orders/orders.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  CreateOrderInput,
  CreateOrderOutput,
} from 'src/orders/dtos/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import {
  GetOrdersInput,
  GetOrdersOutput,
} from 'src/orders/dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from 'src/orders/dtos/get-order.dto';
import {
  EditOrderInput,
  EditOrderOutput,
} from 'src/orders/dtos/edit-order.dto';
import { Inject } from '@nestjs/common';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { OrderUpdatesInput } from 'src/orders/dtos/order-updates.dto';
import {
  TakeOrderInput,
  TakeOrderOutput,
} from 'src/orders/dtos/take-order.dto';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @Role(['Any'])
  getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  @Query(() => GetOrderOutput)
  @Role(['Any'])
  getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  @Mutation(() => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput);
  }

  @Subscription(() => Order, {
    filter: ({ pendingOrders: { ownerId } }, variables, { user }) =>
      ownerId === user.id,
    resolve: (payload) => payload.pendingOrders.order,
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(() => Order)
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { orderUpdates }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        orderUpdates.driverId !== user.id &&
        orderUpdates.customerId !== user.id &&
        orderUpdates.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return orderUpdates.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(() => TakeOrderOutput)
  @Role(['Delivery'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.ordersService.takeOrder(driver, takeOrderInput);
  }
}
