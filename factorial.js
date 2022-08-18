const os = require('os');
const path = require('path');

const { Worker, isMainThread, workerData } = require('worker_threads')

const userCPUCount = os.cpus().length;

const workPath = path.resolve('factorial-worker.js')

const calculateFactorial = (number) => {
  if(number === 0){
    return 1;
  }

  return new Promise(async (parentResolve, parentReject) => {
    const numbers = [...new Array(number)].map((_, index) => index + 1);

    const segmentSize = Math.ceil(numbers.length/userCPUCount);
    const segments = [];

    for(let segmentsIndex = 0; segmentsIndex < userCPUCount; segmentsIndex++){
      const start = segmentsIndex * segmentSize;
      const end = start + segmentSize; 

      const segment = numbers.slice(start, end);
      segments.push(segment);
    }
    try{
      const results = await Promise.all(
        segments.map(segment => 
          new Promise((resolve, reject) => {
            const worker = new Worker(workPath, {
              workerData: segment
            });
            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code)=>{
              if(code !== 0) reject(new Error(`Worker stopped with error ${code}`))
            });
          })
        )
      );

      console.log(results); //list of result from worker

      const finalResult = results.reduce((acc, value) => value * acc, 1); 

      console.log(finalResult);
      parentResolve(finalResult);
    } catch(e) {
      parentReject(e);
    }
  });
}

calculateFactorial(15)