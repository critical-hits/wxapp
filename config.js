/*
小程序全局配置文件
*/
 var ip = ""
// var ip="127.0.0.1"
var host="http://"+ip+":5000"
var db={
  ip,
  port:'3306',
  user:'root',
  db:'wxapp',
  pwd:'qwert12345'
}
var email={
  add:'',
  pwd:''
}
module.exports={
  host,
  db,
  email
}
