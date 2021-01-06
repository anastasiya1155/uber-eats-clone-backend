import { Module } from '@nestjs/common';
import {
  CategoryResolver,
  DishResolver,
  RestaurantsResolver,
} from 'src/restaurants/restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { CategoryRepository } from 'src/restaurants/repositories/category.repository';
import { Dish } from 'src/restaurants/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, Dish])],
  providers: [
    RestaurantsResolver,
    CategoryResolver,
    DishResolver,
    RestaurantsService,
  ],
})
export class RestaurantsModule {}
