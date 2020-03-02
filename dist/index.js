
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./jstween.cjs.production.min.js')
} else {
  module.exports = require('./jstween.cjs.development.js')
}
