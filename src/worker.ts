import 'dotenv-safe/config'

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const main = async () => {
  const nest = await NestFactory.create(AppModule)

  nest.listen(80, () => {
    console.log('nest started at http://localhost')
  })
}

main().catch((err) => {
  console.log(err)
})
