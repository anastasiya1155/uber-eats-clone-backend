import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class RestaurantInput {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
