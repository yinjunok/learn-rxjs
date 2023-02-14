// test.ts
import { MockMethod } from 'vite-plugin-mock'
export default [
  {
    url: '/api/heatbeat',
    method: 'get',
    // response: () => {
    //   return {
    //     code: 0,
    //     data: true,
    //   }
    // },
    rawResponse(_, res) {
      /**
       * 随机小于 .1 的时候响应错误
      */
      const hasError = Math.random() < .1
      res.end(JSON.stringify({ code: hasError ? 1 : 0, data: !hasError }))
    },
  },
  {
    url: '/api/info',
    method: 'post',
    timeout: 2000,
    // response: {
    //   code: 0,
    //   data: {
    //     name: 'vben',
    //   },
    // },
    rawResponse: async (_, res) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined)
        }, 2000)
      })
      res.setHeader('Content-Type', 'text/plain')
      res.statusCode = 200
     /**
       * 随机小于 .1 的时候响应错误
      */
      const hasError = Math.random() < .5
      res.end(JSON.stringify({ code: hasError ? 1 : 0 , data: hasError ? null : { name: 'abcde' } }))
    },
  },
  {
    url: '/api/text',
    method: 'post',
    rawResponse: async (req, res) => {
      let reqbody = ''
      await new Promise((resolve) => {
        req.on('data', (chunk) => {
          reqbody += chunk
        })
        req.on('end', () => resolve(undefined))
      })
      res.setHeader('Content-Type', 'text/plain')
      res.statusCode = 200
      res.end(`hello, ${reqbody}`)
    },
  },
] as MockMethod[]