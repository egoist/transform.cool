const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

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
  }
]

function getTransformFn({ from, to }) {
  const res = transformFns.find(v => v.from === from && v.to === to)
  return res && res.fn
}

app.post('/transform', (req, res) => {
  const {
    from,
    to,
    input,
    transformOptions
  } = req.body

  const transformFn = getTransformFn({ from, to })
  if (transformFn) {
    try {
      const output = transformFn(input, transformOptions)
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