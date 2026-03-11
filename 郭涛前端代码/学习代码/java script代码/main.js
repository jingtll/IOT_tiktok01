// 常量与变量
{

    let count = 0
    count++
    const BASE_URL = 'snjgs'
}
let count = 0
count++
// console.log(count)
//模板字符串
const str1 = 'sdha' + 'sfh'
const str2 = `abc${str1}`
// console.log(str2)
//解构赋值
const [a, b, c] = [1, 2, 3]
// console.log(a, b, c)
const { username, age: userAge, gender, ...otherInfo } = {
    username: '郭涛',
    age: 18,
    gender: "male",
    height: "180cm",
    career: 'student'
}
// console.log(username, userAge, gender, otherInfo)
//数组和对象的扩展
//扩展运算符
const arr1 = [1, 2, 3]
const arr2 = [4, 5, 6]
const arr3 = [...arr1, ...arr2]
// console.log(arr3)
const obj1 = {
    a: 1
}
const obj2 = {
    b: 2
}
const obj3 = {
    name: '郭涛',
    ...obj1,
    ...obj2,
    ...arr3
}
// console.log(obj3)
//数组方法Array.from()
function fn() {
    Array.from(arguments).forEach(function (item) {
        // console.log(item)
    })
}
fn(1, 2, 3, 4)
// 对象的方法 Object.assign()
const objA = {
    name: '郭涛',
    age: 18
}
const objB = {
    gender: 'male'
}
const objC = Object.assign({}, objA, objB)
objB.name = 'a'
// console.log(objA, objB, objC)
//class
class A {
    constructor(name, age) {
        this.name = name
        this.age = age

    }
    introduce() {
        // console.log(`我的名字是${this.name},我的年龄是${this.age}`)
    }
}
const a1 = new A('郭涛', 18)
const a2 = new A('yuanshen', 5)
// console.log(a1, a2)
a1.introduce()
//继承
class B extends A {
    constructor(name, age) {
        super(name, age, gender)
        this.gender = gender
    }
    sayHello() {
        // console.log(`你好我是${this.name}`)
    }
}
const b1 = new B('张阿三', 19 , 'female')
// console.log(b1)
b1.sayHello()
b1.introduce()

//箭头函数
const getSum1 = n => n + 3
const getSum2 = (n1, n2) => n1 + n2
const getSum3 = (n1, n2, ...other) => console.log(n1, n2, other)
console.log(getSum3(10, 13, 24, 34, 54, 13))
const getResult = arr => {
    let sum = 0
    arr.forEach(item => sum += item)
    return sum
}
console.log(getResult([1, 2, 3, 4, 5]))