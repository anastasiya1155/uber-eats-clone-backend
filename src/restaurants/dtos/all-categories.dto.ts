import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from 'src/restaurants/entities/category.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  @Field(() => [Category, { nullable: true }])
  categories?: Category[];
}
