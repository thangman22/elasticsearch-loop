var elasticsearch = require('elasticsearch')

class ElasticsearchLoop {
  constructor () {
    console.warn('This version is will deprecate soon please migrate to Promise based version. See read me for more information')
    this.initConstant()
  }

  initConstant () {
    this.connection = null
    this.total = 0
    this.dataAmount = 0
    this.lastDataAmount = 0
    this.queryDsl = 0
    this.duplicateCount = 0
    this.firstLoop = true
    this.debugMode = false

    this.loopCallback = null
    this.successCallback = null
    this.errorCallback = null
  }

  connect (connectionDetail) {
    this.initConstant()
    this.connection = new elasticsearch.Client(connectionDetail)
  }

  enableDebugMode () {
    this.debugMode = true
  }

  printText (text, debugLog) {
    if (debugLog === true && this.debugMode === true) {
      console.log(text)
    }

    if (!debugLog) {
      console.log(text)
    }
  }

  nullFunction () {

  }

  query (queryDsl, loopCallback, successCallback, errorCallback) {
    if (!this.connection) {
      throw Error('Elasticsearch Connection is not defind.')
    }

    if (!queryDsl) {
      throw Error('Elasticsearch Query is not defind.')
    }

    this.loopCallback = loopCallback || this.printText

    this.successCallback = successCallback || this.nullFunction

    this.errorCallback = errorCallback || this.printText
    this.queryDsl = queryDsl
    this.getMessageLoop()
  }

  getMessageLoop () {
    this.queryDsl.from = 0
    this.queryDsl.size = 300

    this.printText('[Elasticsearch] Loop Start.', true)
    this.connection.search(this.queryDsl, this.getMoreUntilDone.bind(this))
  }

  getMoreUntilDone (error, response) {
    if (!error) {
      this.total = response.hits.total

      if (!this.firstLoop) {
        this.printText('[Elasticsearch] Fetched ' + this.dataAmount.toLocaleString() + ' From ' + this.total.toLocaleString(), true)
      } else {
        this.printText('[Elasticsearch] Total ' + this.total.toLocaleString() + ' Records', true)
        this.firstLoop = false
      }

      response.hits.hits.forEach((hit) => {
        this.loopCallback(hit)
        this.dataAmount++
      })
    } else {
      this.errorCallback(error)
    }

    this.lastDataAmount = this.dataAmount

    if (this.total !== this.dataAmount) {
      this.queryDsl.from = this.queryDsl.from + this.queryDsl.size
      this.connection.search(this.queryDsl, this.getMoreUntilDone.bind(this))
    } else {
      this.printText('[Elasticsearch] Loop Ended.', true)
      this.successCallback()
    }
  }
}

module.exports = new ElasticsearchLoop()
