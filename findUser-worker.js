const { Worker, parentPort, workerData } = require('worker_threads')

//Array of numbers
const users = workerData.users;
const email = workerData.email;

const findUserEmail = (users, email) => {
  return users.find(user => user.email === email)
} 

const result = findUserEmail(users, email);

if(result) parentPort.postMessage(result)