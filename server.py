# coding=utf-8
import datetime
from flask import Flask, g, request, jsonify, json
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

app = Flask(__name__)
r = redis.Redis(host="localhost")
smtp_server = "smtp.163.com"
from_addr = "wxapp_jixie@163.com"
password = "qwert12345"
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
    uid = get_uid(nickname)
    # deadline=query_db("select deadline from info where id='%s'" %(requestid))
    # if(timestamp>format_time(deadline)):
    #     return 'timeout'

    insertSql = "INSERT INTO info (openid,nickname,collect,time,icon,requestid) " \
                "VALUES ('%s','%s','%s','%s','%s','%s');" \
                % (uid, nickname.encode('utf8'), collect, timestamp, icon, requestid)
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
    col = cursor.fetchone()[2]
    result = {}
    result['avatar'] = data[5]
    result['nickname'] = data[6]
    result['info'] = data[2]
    result['col'] = col
    print result
    cursor.close()
    return json.dumps(result)


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
    pri = 0  # pri = request.json['pri']
    uid = get_uid(nickname)
    db = get_connection()
    insertSql = "INSERT INTO request (id,openid,nickname,collect,time,icon," \
                "deadline,type,title,des) " \
                "VALUES ('%s','%s','%s','%s',now(),'%s','%s','%s','%s','%s');" \
                % (id, uid, nickname.encode('utf8'), collect, icon, deadline, pri, title, des)
    print insertSql
    db.set_character_set('utf8')
    db.cursor().execute(insertSql)
    db.commit()
    db.cursor().close()
    return id





@app.route('/mail-send', methods=['POST', 'GET'])
def mail_send():
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
    msg['From'] = _format_addr(u'集些 <%s>' % ('wxapp_jixie'))
    msg['Subject'] = Header(u'【集些】《%s》信息收集表导出' % (title), 'utf-8').encode()
    # 邮件正文是MIMEText:
    msg.attach(MIMEText('<p> 尊敬的用户%s 您好</p><p>你在%s创建的《%s》,信息已经导出'
                        + ',请下载附件查看.</p><p>若有疑问,请进入小程序反馈</p>' % (nickname, \
                                                                 time, title), 'html', 'utf-8'))
    # 添加附件就是加上一个MIMEBase，从本地读取一个图片:
    with open('csv/%s.csv' % (id), 'rb') as f:
        # 设置附件的MIME和文件名，这里是png类型:
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


def save_data():
    pass


def get_data():
    pass


def get_openid(code):
    pass


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
    app.run(host='0.0.0.0', debug=True)
    # write_csv(['1','2','3'],[[11,22,33],[33,44,55]],'test')
