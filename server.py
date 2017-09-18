# coding=utf-8
import datetime
import os
from threading import Timer
import requests
from flask import Flask, g, session,request, jsonify, json, send_from_directory
import csv
import MySQLdb
import redis
from email import encoders
from email.header import Header
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.utils import parseaddr, formataddr
import smtplib

UPLOAD_FOLDER = 'upload/'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif','JPEG','JPG','PNG'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key='123'
r = redis.Redis(host="localhost")
smtp_server = "smtp.163.com"
from_addr = "wxapp_jixie@163.com"
password = "qwert1234"
vote_list=dict()

@app.route('/')
def hello_world():
    print 'hello world'
    return 'Hello World!'


@app.route('/info', methods=['POST', 'GET'])
def info():
    import sys
    reload(sys)
    sys.setdefaultencoding('utf-8')
    import time
    print request.json
    db = get_connection()
    timestamp = str(int(time.time()))
    icon = request.json['path']
    nickname = request.json['nickname']
    collect = request.json['collect']
    requestid = request.json['id']
    pri = 0  # pri = request.json['pri']
    pic=request.json['pic']
    uid =get_uid(nickname)
    # deadline=query_db("select deadline from info where id='%s'" %(requestid))
    # if(timestamp>format_time(deadline)):
    #     return 'timeout'

    insertSql = "INSERT INTO info (openid,nickname,collect,time,icon,requestid,pic) " \
                "VALUES ('%s','%s','%s','%s','%s','%s','%s');" \
                % (uid, nickname.encode('utf8'), collect, timestamp, icon, requestid,pic)
    print insertSql
    db.set_character_set('utf8')
    db.cursor().execute(insertSql)
    db.commit()
    return "success"


@app.route('/vote', methods=['POST', 'GET'])
def vote():
    vote = request.json['vote']
    print vote
    requestid = request.json['id']
    nickname = request.json['nickname']
    avatar = request.json['avatar']
    list_u=vote_list.get(requestid)
    get_uid(nickname)
    select=requestid+":"+vote
    count = r.get(select)
    r.lpush(requestid,nickname)
    if count:
        tmp=int(count) + 1
        r.set(select, tmp)
    else:
        r.set(select, 1)
    r.lpush(select+":nickname", nickname)
    r.lpush(select+":avatar", avatar)
    return "success"


@app.route('/info-detail', methods=['POST', 'GET'])
def info_detail():
    db = get_connection()
    print request.json
    id = request.json['requestid']
    sql = "select * from info where requestid='%s' " % (id)
    db.set_character_set('utf8')
    cursor = db.cursor()
    cursor.execute(sql)
    data = cursor.fetchall()
    results = []
    for i in data:
        result = {}
        result['avatar'] = i[5]
        result['nickname'] = i[6]
        results.append(result)
    print  results
    cursor.close()
    return json.dumps(results)


@app.route('/vote-collect', methods=['POST', 'GET'])
def vote_collect():
    import sys
    reload(sys)
    sys.setdefaultencoding('utf-8')
    import time
    timestamp = int(time.time())
    icon = request.json['path']
    nickname = request.json['nickname']
    title = request.json['title']
    collect = request.json['collect']
    deadline = request.json['deadline']
    des = request.json['des']
    para1 = request.json['anonymous']
    para2 = request.json['mutivote']
    para = str(para1 +";" +para2)
    type = 1  # pri = request.json['pri']
    uid = get_uid(nickname)
    id = str(timestamp) + str(uid)
    db = get_connection()
    insertSql = "INSERT INTO request (id,openid,nickname,collect,time,icon," \
                "deadline,type,title,des,para)"\
                "VALUES ('%s','%s','%s','%s',now(),'%s','%s','%s','%s','%s','%s');" %(id, uid, nickname.encode('utf8'), collect, icon, deadline, type, title, des,para)
    db.set_character_set('utf8')
    db.cursor().execute(insertSql)
    db.commit()
    db.cursor().close()
    return id


@app.route('/info-get', methods=['POST', 'GET'])
def info_get():
    db = get_connection()
    print request.json
    uid = get_uid(request.json['nickname'])
    print 'uid', uid
    sql = "select * from request"
    db.set_character_set('utf8')
    cursor = db.cursor()
    cursor.execute(sql)
    data = cursor.fetchall()
    results = []
    for i in data:
        result = {}
        result['openid'] = i[0]
        now = datetime_toString(datetime.datetime.now())
        if now < i[5]:
            result['dead'] = 'false'
        else:
            result['dead'] = 'true'
        result['type'] = i[6]
        result['title'] = i[7]
        result['id'] = i[9]
        result['des'] = i[8]
        cursor.execute("select count(*) from info where requestid='%s'" % (result['id']))
        result['num'] = cursor.fetchone()[0]
        results.append(result)
    print  results
    cursor.close()
    return json.dumps(results)

@app.route('/vote-detail', methods=['POST', 'GET'])
def vote_detail():
    db = get_connection()
    print request.json
    id = request.json['requestid']
    sql = "select * from request where id='%s' " % (id)
    db.set_character_set('utf8')
    cursor = db.cursor()
    cursor.execute(sql)
    data = cursor.fetchone()
    json_data=dict()
    json_data['col']= data[2]
    print data[2]
    cursor.close()
    for i in range(0,10):
        if r.get(id+':'+str(i)):
            json_data[id+str(i)]=r.get(id+':'+str(i))
    return json.dumps(json_data)

@app.route('/item-get', methods=['POST', 'GET'])
def item_get():
    db = get_connection()
    print request.json
    id = request.json['requestid']
    sql = "select * from info where requestid='%s' " % (id)
    db.set_character_set('utf8')
    cursor = db.cursor()
    cursor.execute(sql)
    data = cursor.fetchall()
    results = []
    for i in data:
        result = {}
        result['avatar'] = i[5]
        result['nickname'] = i[6]
        result['openid'] = i[1]
        result['requestid'] = i[3]
        results.append(result)
    print  results
    cursor.close()
    return json.dumps(results)

@app.route('/item-del', methods=['POST', 'GET'])
def item_del():
    db = get_connection()
    print request.json
    requestid = request.json['requestid']
    sql = "delete from request where id='%s' " % (requestid)
    cursor = db.cursor()
    cursor.execute(sql)
    db.commit()
    cursor.close()
    return 'success'

@app.route('/detail-get', methods=['POST', 'GET'])
def detail_get():
    db = get_connection()
    print request.json
    requestid = request.json['requestid']
    openid = request.json['openid']
    sql = "select * from info where requestid='%s' and openid='%s' " % (requestid, openid)
    sql2 = "select * from request where id='%s'" % (requestid)
    db.set_character_set('utf8')
    cursor = db.cursor()
    cursor.execute(sql)
    data = cursor.fetchone()
    cursor.execute(sql2)
    data2 = cursor.fetchone()
    result = {}
    result['avatar'] = data[5]
    result['nickname'] = data[6]
    result['info'] = data[2]
    result['pic_info']=data[4]
    result['pic']=data2[10]
    result['col'] = data2[2]
    print result
    cursor.close()
    return json.dumps(result)


@app.route("/download_pic/<requestid>/<nickname>/<filename>", methods=['GET'])
def download_pic(requestid,nickname,filename):
    directory =app.config['UPLOAD_FOLDER']+'/'+requestid+'/'+nickname
    return send_from_directory(directory, filename, as_attachment=True)

@app.route('/info-collect', methods=['POST', 'GET'])
def info_collect():
    import sys
    reload(sys)
    sys.setdefaultencoding('utf-8')
    import time
    timestamp = int(time.time())
    nickname = request.json['nickname']
    uid = get_uid(nickname)
    id = str(timestamp) + str(uid)
    return id


@app.route('/info-check', methods=['POST', 'GET'])
def info_check():
    import sys
    reload(sys)
    sys.setdefaultencoding('utf-8')
    import time
    timestamp = int(time.time())
    icon = request.json['path']
    nickname = request.json['nickname']
    title = request.json['title']
    collect = request.json['collect']
    deadline = request.json['deadline']
    des = request.json['des']
    id=request.json['id']
    pic=request.json['pic']
    pri = 0  # pri = request.json['pri']
    uid = get_uid(nickname)
    db = get_connection()
    insertSql = "INSERT INTO request (id,openid,nickname,collect,time,icon," \
                "deadline,title,des,pic) " \
                "VALUES ('%s','%s','%s','%s',now(),'%s','%s','%s','%s','%s');" \
                % (id, uid, nickname.encode('utf8'), collect, icon, deadline,title,des,pic)
    print insertSql
    db.set_character_set('utf8')
    db.cursor().execute(insertSql)
    db.commit()
    db.cursor().close()
    return id

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/upload-file', methods=['GET', 'POST'])
def upload_file():
    requestid=request.form['requestid']
    nickname=request.form['nickname']
    num=request.form['i']
    path=app.config['UPLOAD_FOLDER']+'/'+requestid+'/'+nickname
    isExists=os.path.exists(path)
    if not isExists:
        os.makedirs(path)
    print 'num:',num
    id=get_uid(nickname)
    file = request.files['file']
    if file and allowed_file(file.filename):
        type=file.filename.split('.')[1]
        file.save(os.path.join(path, num+'.'+type))
    return 'success'



@app.route('/mail-send', methods=['POST', 'GET'])
def mail_send():
    import sys
    defaultencoding = 'utf-8'
    if sys.getdefaultencoding() != defaultencoding:
        reload(sys)
    sys.setdefaultencoding(defaultencoding)
    db = get_connection()
    print request.json
    id = request.json['id']
    to_add = request.json['add']
    sql = "select * from info where requestid='%s'" % (id)
    sql2 = "select * from request where id='%s' " % (id)
    db.set_character_set('utf8')
    cursor = db.cursor()
    cursor.execute(sql)
    data = cursor.fetchall()
    cursor.execute(sql2)
    cols = cursor.fetchone()
    results = []
    nickname = cols[1]
    title = cols[7]
    time = cols[3]
    col_names = cols[2].split(";")
    col_names.pop()
    for i in data:
        str = i[2]
        str_arr = str.split(";")
        str_arr.pop()
        results.append(str_arr)
    write_csv(col_names, results, id)
    msg = MIMEMultipart()
    msg['From'] = _format_addr(u'集些 <%s>' % ('wxapp_jixie@163.com'))
    msg['To'] = _format_addr(u'f <%s>' % nickname)
    msg['Subject'] = Header(u'【集些】《%s》信息收集表导出' % (title), 'utf-8').encode()
    # 邮件正文是MIMEText:
    print nickname,title
    text='请查收表格'
    # text='<p> %s 您好</p><p>你在%s创建的《%s》,信息已经导出'\
    #                      ',请下载附件查看.</p><p>若有疑问,请进入小程序反馈</p>'% (nickname,time, title)
    msg.attach(MIMEText(text, 'plain', 'utf-8'))
    # 添加附件就是加上一个MIMEBase，从本地读取一个图片:
    with open('csv/%s.csv' % (id), 'rb') as f:
        # 设置附件的MIME和文件名
        mime = MIMEBase('text', 'csv', filename='%s.csv' % (id))
        # 加上必要的头信息:
        mime.add_header('Content-Disposition', 'attachment', filename='%s.csv' % (id))
        mime.add_header('Content-ID', '<0>')
        mime.add_header('X-Attachment-Id', '0')
        # 把附件的内容读进来:
        mime.set_payload(f.read())
        # 用Base64编码:
        encoders.encode_base64(mime)
        # 添加到MIMEMultipart:
        msg.attach(mime)
    try:
        server = smtplib.SMTP(smtp_server, 25)
        server.set_debuglevel(1)
        server.login(from_addr, password)
        server.sendmail(from_addr, to_add, msg.as_string())
        server.quit()
    except Exception, e:
        print e.message
    return 'success'


def _format_addr(s):
    name, addr = parseaddr(s)
    return formataddr(( \
        Header(name, 'utf-8').encode(), \
        addr.encode('utf-8') if isinstance(addr, unicode) else addr))


def get_uid(name):
    if r.get(name) is not None:
        return r.get(name)
    else:
        uid = int(r.get('wxapp-uid')) + 1
        r.set('wxapp-uid', uid)
        r.set(name, uid)
        return uid


def format_time(time):
    pass


def datetime_toString(dt):
    return dt.strftime("%Y-%m-%d %H-%M")


def string_toDatetime(string):
    return datetime.strptime(string, "%Y-%m-%d %H-%M")


def get_openid(code):
    pass

"""
推送
"""
@app.route('/push-service', methods=['POST', 'GET'])
def push_service():
    import sys
    reload(sys)
    sys.setdefaultencoding('utf-8')
    print request.json
    openid=request.json['openid']
    formid=request.json['formid']
    pushtime=request.json['pushtime']
    url=request.json['url']
    deadline=request.json['deadline']
    title=request.json['title']
    nickname=request.json['nickname']
    db = get_connection()
    insertSql = "INSERT INTO push (openid,formid,pushtime,url,deadline,title,nickname) " \
                "VALUES ('%s','%s','%d','%s','%s','%s','%s');" \
                % (openid, formid, pushtime, url, deadline, title,nickname.encode('utf8'))
    print insertSql
    db.set_character_set('utf8')
    db.cursor().execute(insertSql)
    db.commit()
    return "success"

def loopfunc():
    import time
    """
    取出数据然后直接确认
    :param msg:
    :return:
    """
    print '当前时刻：', time.time(), '定时任务'
    push()

def push():
    import time
    db = get_connection()
    timestamp=time.time()
    sql = "select * from push" \
          " where (pushtime-%d)>=0 and (pushtime-%d)<=600" % (timestamp)
    db.set_character_set('utf8')
    cursor = db.cursor()
    cursor.execute(sql)
    data = cursor.fetchall()
    print 'loopfunc',data
    if data is None or len(data)==0:
        return
    token_url='https://api.weixin.qq.com/cgi-bin/token' \
                  '?grant_type=client_credential' \
                  '&appid=wx5ea5e1393e7bb824&' \
                  'secret=d22572d8c73ac4cc361788a0d66a3fe8'
    token=requests.get(token_url).json()[ "access_token"]
    for i in data:
        openid=i[0]
        formid=i[1]
        url=i[3]
        deadline=i[4]
        title=i[5]
        nickname=i[6]
        data = {
          'touser':openid,
          'template_id': 'G9HCxPV2b28rLADJHRwWycmUge15CE1o3pw91Gwuzak',
          'page':url,
          'form_id': formid,
          'value': {
            "keyword1": {
              "value": '填写模板内容',
              "color": "#4a4a4a"
            },
            "keyword2": {
              "value": deadline,
              "color": "#9b9b9b"
            },
            "keyword3": {
              "value": title,
              "color": "#9b9b9b"
            },
            "keyword4": {
              "value": nickname,
              "color": "#9b9b9b"
            }
          },
          'color': '#ccc',
          'emphasis_keyword': 'keyword1.DATA'
        }
        l='https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send' \
          '?access_token=%s'%(token)
        r=requests.post(url=l,data=data)
        print r.text
    cursor.close()


'''
输出csv表格
'''


def write_csv(col_name, data, filename):
    with open('csv/' + filename + '.csv', 'w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=col_name)
        writer.writeheader()
        for row in data:
            rowdict = {}
            for i in range(0, len(col_name)):
                rowdict[col_name[i]] = row[i]
            writer.writerow(rowdict)


"""
数据库连接
"""


def connect_db():
    return MySQLdb.connect(db='wxapp', host='localhost', user='root', passwd='', charset='utf8')


@app.before_request
def before_request():
    print 'before request'
    g.db = connect_db()


@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()


def query_db(query, args=(), one=False):
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv


def get_connection():
    db = getattr(g, '_db', None)
    if db is None:
        db = g._db = connect_db()
    return db


if __name__ == '__main__':
    Timer(120, loopfunc, ()).start()
    app.run(host='0.0.0.0', debug=True)
    # write_csv(['1','2','3'],[[11,22,33],[33,44,55]],'test')
