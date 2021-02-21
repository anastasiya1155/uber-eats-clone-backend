import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { ILike, Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from 'src/restaurants/dtos/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/restaurants/entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from 'src/restaurants/dtos/edit-restaurant.dto';
import { CategoryRepository } from 'src/restaurants/repositories/category.repository';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from 'src/restaurants/dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from 'src/restaurants/dtos/all-categories.dto';
import {
  CategoryInput,
  CategoryOutput,
} from 'src/restaurants/dtos/category.dto';
import {
  RestaurantsInput,
  RestaurantsOutput,
} from 'src/restaurants/dtos/restaurants.dto';
import {
  RestaurantInput,
  RestaurantOutput,
} from 'src/restaurants/dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from 'src/restaurants/dtos/search-restaurant.dto';
import {
  CreateDishInput,
  CreateDishOutput,
} from 'src/restaurants/dtos/create-dish.dto';
import { Dish } from 'src/restaurants/entities/dish.entity';
import {
  EditDishInput,
  EditDishOutput,
} from 'src/restaurants/dtos/edit-dish.dto';
import {
  DeleteDishInput,
  DeleteDishOutput,
} from 'src/restaurants/dtos/delete-dish.dto';
import { MyRestaurantsOutput } from 'src/restaurants/dtos/my-restaurants';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from 'src/restaurants/dtos/my-restaurant';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        { loadRelationIds: true },
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit restaurant you don't own",
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        loadRelationIds: true,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete restaurant you don't own",
        };
      }
      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (err) {
      return { ok: false, error: 'Could not load categories' };
    }
  }

  async countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return { ok: false, error: 'Category not found' };
      }
      const restaurants = await this.restaurants.find({
        where: { category },
        order: { isPromoted: 'DESC' },
        take: 6,
        skip: (page - 1) * 6,
      });
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (err) {
      return { ok: false, error: 'Could not load category' };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 6,
        take: 6,
        order: { isPromoted: 'DESC' },
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (err) {
      return { ok: false, error: 'Could not load restaurants' };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      return { ok: true, restaurant };
    } catch (err) {
      return { ok: false, error: 'Could not find restaurant' };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: ILike(`%${query}%`) },
        skip: (page - 1) * 6,
        take: 6,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (err) {
      return { ok: false, error: 'Could not search for restaurant' };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: 'You can not do that' };
      }
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );

      return { ok: true };
    } catch (err) {
      console.log(err);
      return { ok: false, error: 'Could not create dish' };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return { ok: false, error: 'You can not do that' };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Could not edit dish' };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return { ok: false, error: 'You can not do that' };
      }
      await this.dishes.delete(dishId);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Could not delete dish' };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return {
        restaurants,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }
  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu', 'orders'] },
      );
      return {
        restaurant,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }
}
