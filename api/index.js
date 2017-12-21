const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { promisify } = require('util')
const babel = require('@babel/core')
const prettier = require('prettier')

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(cors())

const transformFns = [
  {
    from: 'babel',
    to: 'js',
    fn(code, { es2015, es2016, es2017 } = {}, prettierOptions) {
      const options = {
        presets: [
          ...(es2015 ? ['@babel/preset-es2015'] : []),
          ...(es2016 ? ['@babel/preset-es2016'] : []),
          ...(es2017 ? ['@babel/preset-es2017'] : []),
        ],
        babelrc: false
      }
      const output = require('@babel/core').transform(code, options).code
      return prettier.format(output, prettierOptions)
    }
  },
  {
    from: 'buble',
    to: 'js',
    fn(code, options, prettierOptions) {
      const output = require('buble').transform(code, options).code
      return prettier.format(output, prettierOptions)
    }
  },
  {
    from: 'react',
    to: 'vue',
    fn(code, options, prettierOptions) {
      const output = babel.transform(code, {
        plugins: [
          'syntax-class-properties',
          'syntax-jsx',
          'transform-react-to-vue'
        ],
        babelrc: false
      }).code
      return prettier.format(output, prettierOptions)
    }
  },
  {
    from: 'stylus',
    to: 'css',
    async fn(code, options, prettierOptions) {
      const stylus = require('stylus')
      const output = await promisify(stylus.render)(code, { filename: 'nope.css' })
      return prettier.format(output, {
        ...prettierOptions,
        parser: 'css'
      })
    }
  },
  {
    from: 'coffeescript',
    to: 'js',
    fn(code, options, prettierOptions) {
      const output = require('coffeescript').compile(code)
      return prettier.format(output, prettierOptions)
    }
  },
  {
    from: 'svg',
    to: 'react',
    fn(code, options, prettierOptions) {
      const output = require('svgr').default(code)
      return prettier.format(output, prettierOptions) 
    }
  },
  {
    from: 'html',
    to: 'react-jsx',
    fn(code, options, prettierOptions) {
      const output = require('h2x-core').transform(code, {
        plugins: [require('h2x-plugin-jsx').default]
      })
      return prettier.format(output, prettierOptions)
    }
  },
  {
    from: 'flow',
    to: 'js',
    fn(code, options, prettierOptions) {
      const output = babel.transform(code, {
        babelrc: false,
        plugins: [
          '@babel/plugin-transform-flow-strip-types'
        ]
      }).code
      return prettier.format(output, prettierOptions)
    }
  },
  {
    from: 'typescript',
    to: 'js',
    fn(code, options, prettierOptions) {
      const output = babel.transform(code, {
        babelrc: false,
        plugins: [
          '@babel/plugin-transform-typescript'
        ]
      }).code
      return prettier.format(output, prettierOptions)
    }
  }
]

function getTransformFn({ from, to }) {
  const res = transformFns.find(v => v.from === from && v.to === to)
  return res && res.fn
}

app.post('/transform', async (req, res) => {
  const {
    from,
    to,
    input,
    transformOptions,
    prettierOptions
  } = req.body

  const transformFn = getTransformFn({ from, to })
  if (transformFn) {
    try {
      const output = await transformFn(
        input,
        transformOptions, 
        prettierOptions
      )
      res.send({
        output
      })
    } catch (err) {
      console.error(err)
      res.send({
        message: err.message
      })
    }
  } else {
    res.send({
      message: 'not supported'
    })
  }
})

app.listen(2017)
console.log(`Open http://localhost:2017`)