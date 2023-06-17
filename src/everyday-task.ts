#!/usr/bin/env node
import { Log } from './libs/log.js'

import jsdom from 'jsdom'
import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
const { JSDOM } = jsdom

class Task {
  github: string
  webExploreScriptListUrl: string
  constructor() {
    this.github = 'https://raw.githubusercontent.com/vannvan'
    this.webExploreScriptListUrl = this.github + '/web-explore-demo/master/script/filelist.js'
  }

  start() {
    Log.info('任务开始')
    this.crawlInfo()
    // this.getAdoerww()
  }

  async crawlInfo() {
    const webExploreCount = await this.getWebExplore()
    if (webExploreCount) {
      this.writeReadme({
        webExploreCount: webExploreCount,
      })
    }
  }

  getWebExplore(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: this.webExploreScriptListUrl,
        headers: {},
      }
      axios(config).then((res: any) => {
        const data = res.body
        try {
          const names: string = data.replace(/\s|\n/g, '').match(/(?<=\[).+(?=\])/)[0]
          const length = names.split(',').length
          resolve(length)
        } catch (error) {
          Log.error(error.stack)
          reject(null)
        }
      })
    })
  }

  getAdoerww() {
    return new Promise((resolve, reject) => {
      axios.get('https://github.com/vannvan/adoerww').then((res) => {
        // console.log(res.data)
        const dom = new JSDOM(res.data)
        const document = dom.window.document
        console.log(document.querySelector('.js-navigation-open Link--primary'))
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
