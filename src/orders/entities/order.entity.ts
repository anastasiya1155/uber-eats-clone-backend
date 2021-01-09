import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  JoinTable,
  RelationId,
} from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { IsEnum, IsNumber } from 'class-validator';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    eager: true,
  })
  customer?: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    eager: true,
  })
  driver?: User;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  restaurant?: Restaurant;

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem, {
    eager: true,
  })
  @JoinTable()
  items: OrderItem[];

  @Field(() => Number, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @RelationId((order: Order) => order.driver)
  driverId: number;
}
