import { Field, ObjectType } from 'type-graphql'
import {
  activityTypeLabel,
  activityTypeName,
} from '../../interfaces/entities/ActivityTypesTypesValues'
import { IGraphDataset } from '../../interfaces/general/IObjectGraphDataset'

@ObjectType()
export class GraphDataset implements IGraphDataset {
  @Field()
  id: number

  @Field()
  name: activityTypeName

  @Field()
  label: activityTypeLabel

  @Field()
  emoji: string

  @Field()
  backgroundColor: string

  @Field(() => [Number])
  data: number[]
}

@ObjectType()
export class GraphDatasetPie implements IGraphDataset {
  @Field()
  id: number

  @Field()
  name: activityTypeName

  @Field()
  label: activityTypeLabel

  @Field(() => [String])
  emoji: string[]

  @Field(() => [String])
  backgroundColor: string[]

  @Field(() => [Number])
  data: number[]
}
