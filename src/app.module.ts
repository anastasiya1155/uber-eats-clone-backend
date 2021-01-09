import { join } from 'path';
import * as Joi from 'joi';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from 'src/jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from 'src/users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Category } from 'src/restaurants/entities/category.entity';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USERNAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: process.env.NODE_ENV === 'dev',
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
      ],
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'x-jwt';
        if (req) {
          return { token: req.headers[TOKEN_KEY] };
        } else if (connection) {
          return { token: connection.context[TOKEN_KEY] };
        }
      },
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
