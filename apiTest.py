import hashlib
import requests
import datetime
from random import seed
from random import random

seed(datetime.datetime.now())
server = "http://10.0.0.171:3000"

print("Starting API Test")
i = 0
err = False

while(err == False):
    datetimestr = str(datetime.datetime.now())
    canid = "0x3B"
    data = str(random())
    hash = None
    md5 = hashlib.md5()
    md5.update((datetimestr + canid + data).encode('utf-8'))
    hash = md5.hexdigest()

    reqdata = {
        'datetime': datetimestr,
        'canid': canid,
        'data': data,
        'hash': hash
    }
    res = requests.post(url = server, data = reqdata)
    print(str(i) + "     " + str(res.status_code) + "       " + datetimestr + " - " + canid + " - "  + data + " - " + hash)
    if (res.status_code != 200):
        err = True
        print(res.text)
    i = i + 1
    