import { Command } from "nestjs-command"
import { Injectable } from "@nestjs/common"
import { SharkifyService } from "../tasks/sharkify.service"

@Injectable()
export class SharkifyCommands {
  constructor(private readonly sharkifyService: SharkifyService) {}

  @Command({
    command: "save:loans",
    describe: "Fetches all loans using sharkify client and saves in our database",
  })
  async saveLoans() {
    this.sharkifyService.saveLoans()
  }

  @Command({
    command: "save:orderbooks",
    describe: "Fetches all order books using sharkify client and saves in our database",
  })
  async saveOrderBooks() {
    this.sharkifyService.saveOrderBooks()
  }

  @Command({
    command: "save:nftlist",
    describe: "Fetches all nft list using sharkify client and saves in our database",
  })
  async saveNftList() {}
}
