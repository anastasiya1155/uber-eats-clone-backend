import { Module } from '@nestjs/common';
import {
  CategoryResolver,
  RestaurantsResolver,
} from 'src/restaurants/restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { CategoryRepository } from 'src/restaurants/repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [RestaurantsResolver, CategoryResolver, RestaurantsService],
})
export class RestaurantsModule {}
