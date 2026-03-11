
// box.onclick = function () {
//     this.innerText = '新的内容'
//     this.className = 'change'
// }
//1.变量
var num = 10
var myAge = 18
//2.数据类型
var myNum = 10//number 数值类型
var myStr = "文本"
var myName = "郭涛"//string 字符串类型
var myBool = true//false boolean布尔类型
var myNull = null//用于清空变量内容，表示空
var myUN//undifined容器的默认值
console.log(myNum)//控制台
console.log(myUN)
//3.运算符
var sum = 1 - 2 * 3 % 4
console.log(sum)
var resultStr = "hello" + "javaScript"
console.log(resultStr)
var isTure = 2 > 5
console.log(isTure)
console.log(2 === 2)
//4.语句
if (2 > 1) {
    console.log("我会执行")
}




if (isTure) {
    console.log("对的")
}
else {
    console.log("错的")
}




if (5 > 6) {
    console.log(1)

} else if (5 > 5) {
    console.log(2)

} else if (5 > 4) {
    console.log(3)

}
else {
    console.log(4)

}
//for循环
let suM = 0
for (let i = 0; i <= 100; i++) {
    console.log(111)
    if (i % 2 !== 0) {
        suM = suM + i
    }


} console.log(suM)
//函数
function getSum(start,end) {
    console.log("begin")
    let Sum = 0
    for (var i = start; i <= end; i++) {
        Sum += i
    }
    console.log("over")
    return Sum
}
let result1 = getSum(0,100)
console.log(result1)
let result2=getSum(200,300)
console.log(result2)
//多重函数
function getSumWithCondition(start,end,fn){
    var sum=0
    for(var i=start;i<=end;i++){
        if(fn(i)){
            sum +=i
        }
    }
    return sum
}
var result=getSumWithCondition(1,100,function(n){
    if(n%2===0){
        return true
    }
    return false
})
console.log(result)
//数组
var myArr=[10,20,30,40,50]
console.log(myArr.length)
console.log(myArr[0])
console.log(myArr)

myArr.push(60)
myArr.unshift(0)
console.log(myArr)
//用for循环输出索引
var sum=0
for(var i=0;i<myArr.length;i++)
{
    sum+=myArr[i]
    console.log(i, myArr[i])
}
console.log(sum)
//用数组本身特性输出索引
myArr.forEach(function(item,index)
{
    console.log(item,index)
})

//对象
var obj={
    name:"郭涛",
    age:18
}
// console.log(obj)
// console.log(obj.name)

for(var k in obj){
    console.log(k,obj[k])
}