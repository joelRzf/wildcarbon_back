import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import dataSource from './utils/datasource'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/userResolver'
import { ActivityResolver } from './resolvers/activityResolver'
import { ActivityTypeResolver } from './resolvers/activityTypeResolver'
import { GoodDealResolver } from './resolvers/goodDealResolver'
import { TokenResolver } from './resolvers/tokenResolver'
import { IDecodedJWT } from './interfaces/general/IDecodedJWT'
import { User } from './entities/user'
import { DeleteAllEntitiesResolver } from './resolvers/testResolver'
import { GoodDealVoteResolver } from './resolvers/goodDealVoteResolver'
import { GetStatsResolver } from './resolvers/getStatsResolver'
import { FollowingResolver } from './resolvers/followingResolver'
import { ActivityType } from './entities/activityType'
import { IActivityType } from './interfaces/entities/IActivityType'
// import { PopulateInitDb } from './migrations/PopulateInitDb'

dotenv.config()

const port = 5050
export enum activityTypeLabel {
  Transport = 'Transport',
  Numerique = 'Numérique',
  Alimentation = 'Alimentation',
  Energie = 'Energie',
  Electromenager = 'Electroménager',
  Autre = 'Autre',
  QuantiteKG = 'Quantité (kg)',
}

export enum activityTypeName {
  transport = 'transport',
  numeric = 'numeric',
  food = 'food',
  energy = 'energy',
  appliance = 'appliance',
  other = 'other',
  all = 'all',
}

const getActivityTypes = () => {
  return [
    {
      activityTypeId: 1,
      backgroundColor: '#f9ca24',
      emoji: '🚗',
      label: activityTypeLabel.Transport,
      name: activityTypeName.transport,
    },
    {
      activityTypeId: 2,
      backgroundColor: '#f0932b',
      emoji: '💻',
      label: activityTypeLabel.Numerique,
      name: activityTypeName.numeric,
    },
    {
      activityTypeId: 3,
      backgroundColor: '#eb4d4b',
      emoji: '🍕',
      label: activityTypeLabel.Alimentation,
      name: activityTypeName.food,
    },
    {
      activityTypeId: 4,
      backgroundColor: '#6ab04c',
      emoji: '⚡',
      label: activityTypeLabel.Energie,
      name: activityTypeName.energy,
    },
    {
      activityTypeId: 5,
      backgroundColor: '#7ed6df',
      emoji: '🚿',
      label: activityTypeLabel.Electromenager,
      name: activityTypeName.appliance,
    },
    {
      activityTypeId: 6,
      backgroundColor: '#686de0',
      emoji: '🤷‍♂️',
      label: activityTypeLabel.Autre,
      name: activityTypeName.other,
    },
  ]
}

export default getActivityTypes

async function createActivityTypes (){
  const activityTypeRepository = dataSource.getRepository(ActivityType)
  const activityTypes = await activityTypeRepository.find()
  if(activityTypes.length !==6){
    await activityTypeRepository.delete({})
    const allActivityTypes = getActivityTypes()
    const activityTypeObjects = allActivityTypes.map((type) =>
    activityTypeRepository.create(type)
  )
  await activityTypeRepository.insert(activityTypeObjects)
  }
}

async function start(): Promise<void> {
  try {
    await dataSource.initialize()

    // initialisation BDD en DEV
    // console.log('🚀 ~ migration init DB is starting...')
    // const migration = new PopulateInitDb()
    // await migration.up()
    // console.log('🚀 ~ migration init DB done ✅')

  console.log('🚀 ~ activityTypes creation in DB  is starting...')
    await createActivityTypes()
    console.log('🚀 ~ activityTypes creation in DB done ✅')

    const schema = await buildSchema({
      resolvers: [
        TokenResolver,
        UserResolver,
        ActivityResolver,
        ActivityTypeResolver,
        GoodDealResolver,
        GoodDealVoteResolver,
        DeleteAllEntitiesResolver,
        GetStatsResolver,
        FollowingResolver,
      ],
      authChecker: ({ context }, roles) => {
        // roles = roles in @Authorized decorators in resolvers

        if (context.user.email === undefined) {
          return false
        } else if (roles.length === 0 || roles.includes(context.user.role)) {
          return true
        } else {
          return false
        }
      },
    })

    const server = new ApolloServer({
      schema,
      context: async ({ req }) => {
        if (
          req.headers.authorization === undefined ||
          process.env.JWT_SECRET_KEY === undefined
        ) {
          return {}
        } else {
          try {
            const reqJWT = req.headers.authorization

            if (reqJWT.length > 0) {
              const verifiedToken = jwt.verify(
                reqJWT,
                process.env.JWT_SECRET_KEY
              )
              const userToken = verifiedToken as IDecodedJWT

              const user = await dataSource
                .getRepository(User)
                .findOneByOrFail({ email: userToken.email })

              return { user: user }
            } else {
              return {}
            }
          } catch (err) {
            console.log(err)
            return {}
          }
        }
      },
      persistedQueries: false,
    })

    try {
      const { url }: { url: string } = await server.listen({ port })
      console.log(`🚀  Server ready at ${url}`)
    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log('Error while launching the server')
    console.log(error)
  }
}

start()
