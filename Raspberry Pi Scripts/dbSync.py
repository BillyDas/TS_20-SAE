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
#cloud_server = "http://10.0.0.66:3000/sync"
cloud_server = "http://ts20.billydasdev.com:3000/sync"
###################################################
# STATIC VARIABLES
###################################################
SELECT_BULK_QUERY = "SELECT * FROM SensorData ORDER BY UTCTimestamp DESC LIMIT 500"
DELETE_BULK_QUERY = "DELETE FROM SensorData WHERE SensorDataId IN {}"
CancelRequested = False
cursor = None
dbcon = None
retries = 0

# Setup Logging
logging.basicConfig(format='%(levelname)s:%(message)s', level=logLevel)

###################################################
# BACKGROUND FUNCTIONS
###################################################
# Connect to the local database
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

# Pulls data from the database to be synced as an array of Row Dictionary.
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

# Builds data into request data from a db data array.
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

# Removes rows from the database that have been Synced
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
logging.info("DBSync Started")
while not CancelRequested:    
    if (cursor == None):
        connected = connectDB()
    if (cursor != None):        
        dataArr, delArr = getDBArray()        
        if (len(dataArr) > 0):
            retries = 0
            reqData = buildReqMultiData(dataArr)
            logging.debug(reqData)
            if (reqData != None):
                uploaded = uploadData(reqData)
                if uploaded:
                    logging.debug("Uploaded to Cloud DB Successfully")
                    removed = removeRows(delArr)            
        else:             
            if (retries < 40):
                retries += 1
            logging.debug("No data - Sleeping for " + str(retries * 2)  + " seconds")         
            time.sleep(retries * 2)
            cursor = None