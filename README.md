# Elasticsearch loop


Elasticsearch Loop is package are made your elasticsearch full paging loop is easier. Just few line of code you could loop all paging and take action with your data in elasticsearch

### Installation
```
npm install elasticsearch-loop
```

### Example

```javascript
var elasticLoop = require("elasticsearch-loop");

// Connect Elasticsearch
elasticLoop.connect({
    host: 'localhost:9200'
});

//Remove comment when you want to debug
//elasticLoop.debugMode();

elasticLoop.query({
        index: 'main',
        q: 'time:[2016-01-01 TO 2016-12-31]',
},function(data){
    //What do you want to do with each data.
},function(data){
    //What do you want to do when your loop is success finish.
},function(data){
    //What do you want to do when query is error.
});

```
### Example (Promise Based)

```javascript
var elasticLoop = require("elasticsearch-loop/es");

// Connect Elasticsearch
(async () => {
  const connect = elasticLoop.connect({
    host: 'localhost:9200'
  })
  const res = await connect.query({
    index: 'main',
    q: 'time:[2016-01-01 TO 2016-12-31]',
  })
  console.log(res)
})()
```

### Remark
* This library is using scan & score method
* Query and connection parameter reference from https://github.com/elastic/elasticsearch-js
