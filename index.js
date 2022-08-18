const { payloads } = require('./payloads.json')
const LEADING_ZEROES = 4
const { Worker, isMainThread } = require('worker_threads')

if (isMainThread) {
  for (let payload of payloads) {
    const worker = new Worker(__filename, { env: { LEADING_ZEROES } })
    worker.once('message', (message) => {
      final.push(message)
      finishedWorkers++
      if (finishedWorkers === payloads.length) console.log(final)
    })
    worker.on('error', console.error)

    console.log(`Iniciando worker de ID ${worker.threadId} e enviando o payload "${payload}"`)
    worker.postMessage(payload)
  }
}