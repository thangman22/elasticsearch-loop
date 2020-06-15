var elasticsearch = require('elasticsearch')

class ElasticsearchLoop {
  constructor () {
    this._connection = null
    this._total = 0
    this._dataAmount = 0
    this._lastDataAmount = 0
    this._queryDsl = {}
    this._firstLoop = true
    this._debug = false
    this.loopCallback = null
    this.successCallback = null
    this.errorCallback = null
  }

  connect (connectionDetail) {
    this._connection = new elasticsearch.Client(connectionDetail)
    return this
  }

  get debug () {
    return this._debug
  }

  set debug (status) {
    this._debug = status
  }

  _printDebug (text, debugLog) {
    if (debugLog === true && this._debug === true) {
      console.log(text)
    }
  }

  query (queryDsl, loopCallback) {
    const returnData = []
    return new Promise((resolve, reject) => {
      if (!this._connection) {
        reject(Error('Elasticsearch Connection is not defind.'))
      }

      if (!queryDsl) {
        reject(Error('Elasticsearch Query is not defind.'))
      }

      this._initLoop(queryDsl, (data) => {
        if (loopCallback) {
          loopCallback(data)
        }
        returnData.push(data)
      }, () => {
        resolve(returnData)
      }, (error) => {
        reject(Error(error))
      })
    })
  }

  _initLoop (queryDsl, loopCallback, successCallback, errorCallback) {
    this.loopCallback = loopCallback

    this.successCallback = successCallback

    this.errorCallback = errorCallback
    this._queryDsl = queryDsl
    this._getMessageLoop()
  }

  _getMessageLoop () {
    this._queryDsl.from = 0
    this._queryDsl.size = 300
    this._printDebug('[Elasticsearch] Loop Start.', true)
    this._connection.search(this._queryDsl, this._getMoreUntilDone.bind(this))
  }

  _getMoreUntilDone (error, response) {
    if (!error) {
      this._total = response.hits.total

      if (!this._firstLoop) {
        this._printDebug('[Elasticsearch] Fetched ' + this._dataAmount.toLocaleString() + ' From ' + this._total.toLocaleString(), true)
      } else {
        this._printDebug('[Elasticsearch] Total ' + this._total.toLocaleString() + ' Records', true)
        this._firstLoop = false
      }

      response.hits.hits.forEach((hit) => {
        this.loopCallback(hit)
        this._dataAmount++
      })
    } else {
      this.errorCallback(error)
    }

    this._lastDataAmount = this._dataAmount

    if (this._total !== this._dataAmount) {
      this._queryDsl.from = this._queryDsl.from + this._queryDsl.size
      this._connection.search(this._queryDsl, this._getMoreUntilDone.bind(this))
    } else {
      this._printDebug('[Elasticsearch] Loop Ended.', true)
      this.successCallback()
    }
  }
}

module.exports = new ElasticsearchLoop()
