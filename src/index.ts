import { ApolloServer } from 'apollo-server-express'
import express, { Request, Response } from 'express'
import session from 'express-session'
import { buildSchema } from 'type-graphql'
// import { NestFactory } from "@nestjs/core"
// import { AppModule } from "./app.module"
import cors from 'cors'
import { __prod__ } from './constants'
import { AppDataSource } from './utils/db'
import { LoanResolver, OrderBookResolver, UserResolver } from './resolvers'
import cookieParser from 'cookie-parser'
import restRouter from './utils/restapi'
import dotenv from 'dotenv'

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

  // APOLLO
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [LoanResolver, OrderBookResolver, UserResolver],
      validate: false,
    }),
    csrfPrevention: false,
    context: async ({ req, res }: IContext) => {
      try {
        await AppDataSource.initialize()
      } catch (_) {}

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

  // const nest = await NestFactory.create(AppModule)

  // nest.listen(8001, () => {
  //   console.log("nest started at localhost:8001")
  // })
}

main().catch((err) => {
  console.log(err)
})
