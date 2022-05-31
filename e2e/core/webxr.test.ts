import { XREngineBot } from 'XREngine-bot/src/bot'
import { BotHooks } from '@xrengine/engine/src/bot/enums/BotHooks'

import { setupXR, testWebXR } from '../utils/testWebXR'

const domain = process.env.APP_HOST
const locationName = 'test'

describe.skip('WebXR Bot Tests', () => {
  const bot = new XREngineBot({ name: 'bot-' + Date.now(), verbose: true })

  before(async () => {
    await bot.launchBrowser()
    await bot.enterLocation(`https://${domain}/location/${locationName}`)
    await bot.awaitHookPromise(BotHooks.LocationLoaded)
    await setupXR(bot)
  })

  after(async () => {
    await bot.quit()
  })

  testWebXR(bot)
})