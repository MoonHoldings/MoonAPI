import 'dotenv-safe/config'

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const main = async () => {
  const nest = await NestFactory.create(AppModule)
  const port = process?.env?.WORKER_PORT ?? 80
  
  nest.listen(port, () => {
    console.log('nest started at http://localhost')
  })
}

main().catch((err) => {
  console.log(err)
})
