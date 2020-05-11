#############################################################
#   Database Syncing Software v1.0.0
#   Author: Baylin Ferguson
#   Description: This software syncs the local DB to the cloud using the API
#############################################################
import mysql.connector
import requests
import hashlib
import time
from requests.exceptions import ConnectionError

cloud_server = "http://10.0.0.171:3000"

ErrorOccurred = False

try:
    dbcon = mysql.connector.connect(
        host='localhost', user='ts20', password='ts20', database='ts20')
except mysql.connector.Error as err:
    print(err)

cursor = dbcon.cursor()
query = "SELECT * FROM SensorData ORDER BY UTCTimestamp DESC LIMIT 1"

while not ErrorOccurred:
    try:
        cursor.execute(query)
        for (SensorDataId, CanId, Data, UTCTimestamp) in cursor:
            print("{}   {}  {}  {}".format(
                SensorDataId, CanId, Data, UTCTimestamp))
            md5 = hashlib.md5()
            md5.update((str(UTCTimestamp) + str(CanId) +
                        str(Data)).encode('utf-8'))
            hash = md5.hexdigest()
            reqdata = {
                'datetime': UTCTimestamp,
                'canid': CanId,
                'data': Data,
                'hash': hash
            }
            print(reqdata)
            try:
                res = requests.post(url=cloud_server, data=reqdata)
                if (res.status_code == 200):
                    # Delete Row From Local Database as it added to cloud successfully
                    print("Added Local Record {} to Cloud Database Successfully".format(SensorDataId))
                else:
                    # 400 or 500 error probably occurred
                    print("Something Fucked Up")
            except ConnectionError as ce:
                print("Error getting to server \n" + str(ce))
                time.sleep(30)
    except Exception as ex:
        print("Error Occured somewhere: \n" + str(ex))
        ErrorOccurred = True

dbcon.close()
