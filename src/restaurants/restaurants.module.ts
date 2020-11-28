import { Module } from '@nestjs/common';
import { RestaurantsResolver } from 'src/restaurants/restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsService } from 'src/restaurants/restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [RestaurantsResolver, RestaurantsService],
})
export class RestaurantsModule {}
