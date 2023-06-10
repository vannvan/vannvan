#!/usr/bin/env node
import { Log } from './libs/log.js'

import jsdom from 'jsdom'
import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

class Task {
  github: string
  webExploreScriptListUrl: string
  constructor() {
    this.github = 'https://github.com/vannvan'
    this.webExploreScriptListUrl = this.github + '/web-explore-demo/blob/master/script/filelist.js'
  }

  start() {
    Log.info('每日任务开始')
    this.crawlInfo()
  }

  async crawlInfo() {
    const cookie = process.argv[2]
    if (!cookie) {
      Log.error('没有cookie，退出任务')
      process.exit(0)
    }
    console.log(cookie)
    const webExploreCount = await this.getWebExplore(cookie)
    if (webExploreCount) {
      this.writeReadme({
        webExploreCount: webExploreCount,
      })
    }
  }

  getWebExplore(cookie: string): Promise<number | null> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.webExploreScriptListUrl, {
          headers: {
            accept: 'application/json',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'if-none-match': 'W/"39e8efa0b94665537f7d855920bc890e"',
            'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-github-target': 'dotcom',
            'x-requested-with': 'XMLHttpRequest',
            cookie: cookie,
            Referer: 'https://github.com/vannvan/web-explore-demo/blob/master/script/filelist.js',
            'Referrer-Policy': 'no-referrer-when-downgrade',
          },
        })
        .then((res) => {
          const { blob } = res.data.payload
          try {
            const names: string = blob.rawBlob.replace(/\s|\n/g, '').match(/(?<=\[).+(?=\])/)[0]
            const length = names.split(',').length
            resolve(length)
            this.writeReadme({
              webExploreCount: length,
            })
          } catch (error) {
            Log.error(error.stack)
            reject(null)
          }
        })
    })
  }

  writeReadme(args: { webExploreCount: number }) {
    const { webExploreCount } = args
    const REG_MAP = {
      WEB_EXPLORE_COUNT: webExploreCount,
    }

    const regex = new RegExp(Object.keys(REG_MAP).join('|'), 'g')

    const content = readFileSync(path.resolve('./template.md'), 'utf-8').replace(
      regex,
      (matched) => REG_MAP[matched]
    )

    Log.help(content)
    writeFileSync(path.resolve('./README.md'), content)
    Log.success('数据已更新')
  }
}

new Task().start()
