#############################################################
#   Database Sync v1.0.0
#   Author: Baylin Ferguson
#   Description: This software syncs the local DB with the cloud via the cloud API
#############################################################
import mysql.connector
import requests
import hashlib
import time
from requests.exceptions import ConnectionError
import logging
import json

###################################################
# SETTINGS
###################################################
logLevel = logging.INFO
#cloud_server = "http://10.0.0.171:3000/sync"
cloud_server = "http://ts20.billydasdev.com:3000/sync"
###################################################
# STATIC VARIABLES
###################################################
SELECT_QUERY = "SELECT * FROM SensorData ORDER BY UTCTimestamp DESC LIMIT 1"
SELECT_BULK_QUERY = "SELECT * FROM SensorData ORDER BY UTCTimestamp DESC LIMIT 500"
DELETE_QUERY = "DELETE FROM SensorData WHERE SensorDataId = '{}'"
DELETE_BULK_QUERY = "DELETE FROM SensorData WHERE SensorDataId IN {}"
CancelRequested = False
cursor = None
dbcon = None

# Setup Logging
logging.basicConfig(format='%(levelname)s:%(message)s', level=logLevel)

###################################################
# BACKGROUND FUNCTIONS
###################################################

def connectDB():
    try:
        global cursor, dbcon
        dbcon = mysql.connector.connect(
            host='localhost', user='ts20', password='ts20', database='ts20')
        cursor = dbcon.cursor()
        return True
    except mysql.connector.Error as err:
        logging.error("Error Connecting To Database: \n" + str(err))
        return False


def getDBRow():
    try:
        global cursor
        cursor.execute(SELECT_QUERY)
        for (SensorDataId, CanId, Data, UTCTimestamp) in cursor:
            logging.debug("{}   {}  {}  {}".format(
                SensorDataId, CanId, Data, UTCTimestamp))
            return SensorDataId, CanId, Data, UTCTimestamp
    except Exception as ex:
        logging.error("Error Occured getting Row from DB: \n" + str(ex))
        return None, None, None, None

def getDBArray():
    try:
        global cursor
        cursor.execute(SELECT_BULK_QUERY)
        rowArr = list()
        delArr = list()
        for (SensorDataId, CanId, Data, UTCTimestamp) in cursor:
            rowDict = {}
            rowDict["SensorDataId"] = SensorDataId
            rowDict["CanId"] = CanId
            rowDict["Data"] = Data
            rowDict["UTCTimestamp"] = str(UTCTimestamp)
            rowArr.append(rowDict)
            delArr.append(SensorDataId)
        return rowArr, delArr
    except Exception as ex:
        logging.error("Error Occurred getting DB Array: \n" + str(ex))

def buildReqMultiData(dataArr):
    try:
        data = json.dumps(str(dataArr))
        dataFixed = data.replace('"', '')
        md5 = hashlib.md5()
        md5.update(dataFixed.encode('utf-8'))
        hash = md5.hexdigest()
        reqdata = {
            'data': dataFixed,
            'hash': hash
        }
        return reqdata
    except:
        logging.error("Error Occurred Bulding Bulk Request Data")
        return None

def buildReqData(CanId, Data, UTCTimestamp):
    try:
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
        return reqdata
    except:
        logging.error("Error Occurred Bulding Request Data")
        return None

# Uploads Data to API and Returns True if completed successfully.
def uploadData(reqData):
    try:
        res = requests.post(url=cloud_server, data=reqData)
        if (res.status_code == 200):
            logging.debug("Added Record to Cloud Database Successfully")
            return True
        else:
            # 400 or 500 error probably occurred
            logging.error("Error Submitting to API - Status: " + str(res.status_code))
            return False
    except ConnectionError as ce:
        logging.error("Error connecting to API server \n" + str(ce))
        return False

def removeRow(SensorDataId):
    try:
        global cursor, dbcon
        cursor.execute(DELETE_QUERY.format(SensorDataId))
        dbcon.commit()
        return True
    except Exception as ex:
        logging.error("Error Occured Removing Row: \n" + str(ex))
        return False

def removeRows(delArr):
    try:
        global cursor, dbcon
        toDelete = str(delArr)
        toDelete = toDelete.replace('[', '(')
        toDelete = toDelete.replace(']', ')')
        cursor.execute(DELETE_BULK_QUERY.format(toDelete))
        dbcon.commit()
        return True
    except Exception as ex:
        logging.error("Error Occured Removing Row: \n" + str(ex))
        return False


###################################################
# MAIN FUNCTION
###################################################

while not CancelRequested:
    if (cursor == None):
        connected = connectDB()
    if (cursor != None):
        dataArr, delArr = getDBArray()
        if (len(dataArr) > 0):
            reqData = buildReqMultiData(dataArr)
            logging.debug(reqData)
            if (reqData != None):
                uploaded = uploadData(reqData)
                if uploaded:
                    logging.info("Uploaded to Cloud DB Successfully")
                    removed = removeRows(delArr)
            logging.debug(reqData)            
        else:
            time.sleep(30)




        '''SensorDataId, CanId, Data, UTCTimestamp = getDBRow()
        if (SensorDataId != None):
            reqData = buildReqData(CanId, Data, UTCTimestamp)
            if (reqData != None):
                uploaded = uploadData(reqData)
                if uploaded:
                    logging.info("Uploaded to Cloud DB Successfully")
                    removed = removeRow(SensorDataId)
            time.sleep(30)
        else:
            time.sleep(30)'''