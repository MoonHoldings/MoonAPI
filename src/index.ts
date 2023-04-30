import { ApolloServer } from 'apollo-server-express'
import express, { Request, Response } from 'express'
import session from 'express-session'
import { AuthChecker, buildSchema } from 'type-graphql'
import cors from 'cors'
import { __prod__ } from './constants'
import { AppDataSource } from './utils/db'
import { LoanResolver, OrderBookResolver, UserResolver } from './resolvers'
import cookieParser from 'cookie-parser'
import restRouter from './utils/restapi'
import dotenv from 'dotenv'
import { ContextType } from '@nestjs/common'
import { UserRole } from './types'
import { AuthToken } from './entities'

dotenv.config()

export type IContext = {
  req: Request<any> & { session: any }
  res: Response
}

const app = express()

const main = async () => {
  // EXPRESS

  const whitelist = process?.env?.CORS_ALLOW_ORIGIN?.split(',') ?? []
  const corsOptions = {
    origin: function (origin: any, callback: any) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback()
      }
    },
    credentials: true,
  }
  app.use(cors(corsOptions))
  app.use(cookieParser())
  app.use('/', restRouter)

  // REDIS
  // let RedisStore = require("connect-redis")(session)
  // const redisClient = createClient({ legacyMode: true })
  // redisClient.connect().catch(console.error)

  app.use(
    session({
      name: 'qid',
      // store: new RedisStore({
      //   client: redisClient,
      //   disableTouch: true,
      // }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: !__prod__, // cookie only works in http
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : '',
      resave: false,
    })
  )

  try {
    await AppDataSource.initialize()
  } catch (_) {}

  const authChecker: AuthChecker<ContextType> = async ({ context }: { context: any }, roles) => {
    try {
      const token = context?.req?.headers?.authorization?.substring('Bearer '.length)

      if (token && roles.includes(UserRole.Superuser)) {
        const authToken = await AuthToken.findOne({ select: ['id'], where: { token: token } })

        if (authToken) {
          return true
        }
      }

      return false
    } catch (error) {
      console.log(error)
    }

    return true
  }

  // APOLLO
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [LoanResolver, OrderBookResolver, UserResolver],
      validate: false,
      authChecker,
    }),
    csrfPrevention: false,
    context: async ({ req, res }: IContext) => {
      return {
        req,
        res,
      }
    },
  })
  await apolloServer.start()

  apolloServer.applyMiddleware({ app, cors: false })

  app.listen(process.env.PORT || 80, () => {
    console.log(`server started at http://localhost:${process.env.PORT ?? ''}/graphql`)
  })
}

main().catch((err) => {
  console.log(err)
})
