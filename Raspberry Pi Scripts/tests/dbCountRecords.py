#############################################################
#   Database Sync v1.0.0
#   Author: Baylin Ferguson
#   Description: This software syncs the local DB with the cloud via the cloud API
#############################################################
import mysql.connector
import os
import time

###################################################
# STATIC VARIABLES
###################################################
SELECT_QUERY = "SELECT COUNT(*) as Count FROM SensorData"
CancelRequested = False
cursor = None
dbcon = None

###################################################
# BACKGROUND FUNCTIONS
###################################################

def cls():
    os.system('cls' if os.name=='nt' else 'clear')

def connectDB():
    try:
        global cursor, dbcon
        dbcon = mysql.connector.connect(
            host='localhost', user='ts20', password='ts20', database='ts20')
        cursor = dbcon.cursor()
        return True
    except mysql.connector.Error as err:
        print("Error Occured connecting to DB: \n" + str(ex))
        return False

def getDBCount():
    try:
        global cursor
        cursor.execute(SELECT_QUERY)
        for (Count) in cursor:
            cls()
            countstr = str(Count).replace('(','').replace(',','').replace(')','')
            print("Count of Sensordata: \n{}".format(countstr))
    except Exception as ex:
        print("Error Occured getting Row from DB: \n" + str(ex))

def closeDB():
    try:
        global cursor, dbcon
        cursor = None
        dbcon = None
    except Exception as ex:
        print("Error Occured disconnecting from DB: \n" + str(ex))
    

###################################################
# MAIN FUNCTION
###################################################
while not CancelRequested:
    connectDB()
    if (cursor != None):
        getDBCount()
        closeDB()
        time.sleep(0.05)
