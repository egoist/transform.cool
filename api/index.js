const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { promisify } = require('util')

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
    fn(code, { es2015, es2016, es2017 } = {}) {
      const options = {
        presets: [
          ...(es2015 ? ['@babel/preset-es2015'] : []),
          ...(es2016 ? ['@babel/preset-es2016'] : []),
          ...(es2017 ? ['@babel/preset-es2017'] : []),
        ],
        babelrc: false
      }
      return require('@babel/core').transform(code, options).code
    }
  },
  {
    from: 'buble',
    to: 'js',
    fn(code, options) {
      return require('buble').transform(code, options).code
    }
  },
  {
    from: 'react',
    to: 'vue',
    fn(code) {
      return require('@babel/core').transform(code, {
        plugins: [
          'syntax-class-properties',
          'syntax-jsx',
          'transform-react-to-vue'
        ],
        babelrc: false
      }).code
    }
  },
  {
    from: 'stylus',
    to: 'css',
    fn(code) {
      const stylus = require('stylus')
      return promisify(stylus.render)(code, { filename: 'nope.css' })
    }
  },
  {
    from: 'coffeescript',
    to: 'js',
    fn(code) {
      return require('coffeescript').compile(code)
    }
  },
  {
    from: 'svg',
    to: 'react',
    fn(code) {
      return require('svgr').default(code)
    }
  },
  {
    from: 'html',
    to: 'react-jsx',
    fn(code) {
      return require('h2x-core').transform(code, {
        plugins: [require('h2x-plugin-jsx').default]
      })
    }
  },
  {
    from: 'flow',
    to: 'js',
    fn(code) {
      return require('@babel/core').transform(code, {
        babelrc: false,
        plugins: [
          '@babel/plugin-transform-flow-strip-types'
        ]
      }).code
    }
  },
  {
    from: 'typescript',
    to: 'js',
    fn(code) {
      return require('@babel/core').transform(code, {
        babelrc: false,
        plugins: [
          '@babel/plugin-transform-typescript'
        ]
      }).code
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
    transformOptions
  } = req.body

  const transformFn = getTransformFn({ from, to })
  if (transformFn) {
    try {
      const output = await transformFn(input, transformOptions)
      res.send({
        output
      })
    } catch (err) {
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