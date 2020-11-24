import { Module } from '@nestjs/common';
import { RestaurantsResolver } from 'src/restaurants/restaurants.resolver';

@Module({
  providers: [RestaurantsResolver],
})
export class RestaurantsModule {}
