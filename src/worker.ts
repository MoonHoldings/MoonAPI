import 'dotenv-safe/config'

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const main = async () => {
  const nest = await NestFactory.create(AppModule)

  nest.listen(8001, () => {
    console.log('nest started at localhost:8001')
  })
}

main().catch((err) => {
  console.log(err)
})
