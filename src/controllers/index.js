const Admin = require('../lib/admin')
const fs = require('fs-extra')
const path = require('path')

const staticJS = [
  'alerts.js',
  'graph.js',
  'index.js',
  'modify_balance.js',
  'ping.js',
  'receive.js',
  'send.js'
].map((file) => path.resolve(__dirname, '../../static/' + file))

class IndexController {
  constructor (deps) {
    this.admin = deps(Admin)
  }

  async init (router) {
    router.get('/', async ctx => {
      await ctx.render('index')
    })

    router.get('/actions/index/my_address', async ctx => {
      const { address } = await this.admin.query('accounts')
      ctx.body = { address }
    })

    router.get('/api/modify_balance', async (ctx) => {
      const accountData = await this.admin.query('accounts')
      const locals = {
        accounts: Object.keys(accountData.accounts)
      }
      await ctx.render('modify_balance', locals)
    })

    router.get('/api/:command', async ctx => {
      let locals = {}
      if (ctx.params.command in Admin.ADMIN_COMMANDS) {
        locals = await this.admin.query(ctx.params.command)
        locals._root = Object.assign({}, locals)
      }

      await ctx.render(ctx.params.command, locals)
    })

    router.post('/api/balance', async (ctx) => {
      const res = await this.admin.modifyBalance(ctx.request.body)
      ctx.status = res.status
      if (!res.ok) ctx.body = await res.text()
    })

    router.delete('/api/alerts/:id', async (ctx) => {
      const res = await this.admin.deleteAlert(ctx.params.id)
      console.log("DELETE!!!", ctx.params.id, res.status)
      ctx.status = res.status
    })

    staticJS.forEach((file) => {
      router.get('/' + path.basename(file), async (ctx) => {
        ctx.set('Content-Type', 'text/javascript')
        ctx.body = await fs.readFile(file)
      })
    })
  }
}

module.exports = IndexController
