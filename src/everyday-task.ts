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
  getAdoerwwScriptUrl: string
  constructor() {
    this.github = 'https://raw.githubusercontent.com/vannvan'
    this.webExploreScriptListUrl = this.github + '/web-explore-demo/master/script/filelist.js'
    this.getAdoerwwScriptUrl = this.github + '/adoerww//master/scripts/filelist.js'
  }

  async start() {
    Log.info('任务开始')
    this.crawlInfo()

    // let ss = await this.getAdoerww()
    // console.log(ss)
  }

  async crawlInfo() {
    const webExploreCount = await this.getWebExplore()
    const adoerwwCount = await this.getAdoerww()
    if (webExploreCount) {
      this.writeReadme({
        webExploreCount: webExploreCount,
        adoerwwCount: adoerwwCount,
      })
    }
  }

  /**
   * 待优化
   * @returns
   */
  getWebExplore(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: this.webExploreScriptListUrl,
        headers: {},
      }
      axios(config).then((res: any) => {
        const data = res.data
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

  getAdoerww(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: this.getAdoerwwScriptUrl,
        headers: {},
      }
      axios(config).then((res: any) => {
        const data = res.data
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

  writeReadme(args: { webExploreCount: number; adoerwwCount: number }) {
    const { webExploreCount, adoerwwCount } = args
    const REG_MAP = {
      WEB_EXPLORE_COUNT: webExploreCount,
      ADOERWW_COUNT: adoerwwCount,
      AUTO_UPDATE_TIME: Date().toLocaleUpperCase(), // 每次更新一下时间避免无改动后面的git操作失败
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
