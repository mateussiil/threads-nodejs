const { Worker, isMainThread, workerData } = require('worker_threads')

const os = require('os');
const path = require('path');
const users = require('./users.json');

const userCPUCount = os.cpus().length;

const workPath = path.resolve('findUser-worker.js')

const findUserEmail = (user, email) => {
  return new Promise(async (parentResolve, parentReject) => {
    const segmentSize = Math.ceil(user.length/userCPUCount);
    const segments = [];

    for(let segmentsIndex = 0; segmentsIndex < userCPUCount; segmentsIndex++){
      const start = segmentsIndex * segmentSize;
      const end = start + segmentSize; 

      const segment = user.slice(start, end);
      segments.push(segment);
    }

    try{
      const result = await Promise.any(
        segments.map(segment => 
          new Promise((resolve, reject) => {
            const worker = new Worker(workPath, {
              workerData: {users: segment, email}
            });
            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code)=>{
              if(code !== 0) reject(new Error(`Worker stopped with error ${code}`))
            });
          })
        )
      );
      parentResolve(result);
    } catch(e) {
      parentReject(e);
    }
  });
}

findUserEmail(users, "guthrieferguson@biospan.com")