//1.promise异步处理，常见的异步任务：定时器 Ajax
// console.log('任务一:...同步')
// console.log('任务二:...同步')

// setTimeout(() => {
//     console.log('任务三:...异步')
// },0);
// console.log('任务四:...同步')


// const p1 = new Promise((resolve, reject) => {
    // resolve('任务1:成功的数据')
//     reject('任务1失败的信息')

// })
// console.log(p1)


// p1.then(data => {
//     console.log(data)
//     return new Promise((resolve, reject) => {
//         resolve('任务2:成功的数据')
//         // reject('任务失败的信息')

//     })
// }, err => {
//     console.log('任务一失败了')
//     throw new Error('任务一失败了')
// })
//     .then(data => {
//         console.log(data)
//     },
//         err => {
//             console.log('任务二失败了')

//         })
//     .catch(err => {
//         console.log(err)
//     })




//Async await
//步骤1：准备一个返回promise对象的函数
function asyncTask() {
    return new Promise((resolve, reject) => {
        const isSuccess=true
        if(isSuccess){
            resolve('任务2:成功的的处理结果')
        }else{
            reject('任务2:失败的处理结果')
        }
    })
}

//步骤2：为使用await的函数添加async
async function main(){
    console.log('任务一')
    const data= await asyncTask()
    console.log(data)
     console.log('任务三')

}
main()