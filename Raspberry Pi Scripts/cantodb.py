#############################################################
#   CAN to DB v1.0.0
#   Author: Baylin Ferguson
#   Description: This software gathers the Telemetry from CAN bus and stores it in the local DB
#############################################################
import mysql.connector
import can
import struct
import logging
import datetime

#Settings
logLevel = logging.INFO

# Global Variables
INSERT_QUERY = "INSERT INTO SensorData (CanId, Data, UTCTimestamp) Values ('{}','{}','{}')"
connectedDB = False
dbCon = None

# Setup Logging
logging.basicConfig(format='%(levelname)s:%(message)s', level=logLevel)

# Setup Can Bus
can_interface = 'can0'
bus = can.interface.Bus(can_interface, bustype='socketcan')

# Connect to local database
def connectDB():
    try:
        global dbCon
        dbCon = mysql.connector.connect(
            host='localhost', user='ts20', password='ts20', database='ts20')
    except mysql.connector.Error as err:
        logging.error("Error Connecting To Database: \n" + str(err))
        return None

# Add row to DB in data table
def addDB(canId, timestamp, data):
    try:
        tsFormatted = datetime.datetime.fromtimestamp(timestamp)
        querystr = INSERT_QUERY.format(hex(canId), data, tsFormatted)
        logging.debug("\n" + querystr + "\n")
        dbCon.cursor().execute(querystr)
        dbCon.commit()
        logging.debug("Added Row to DB")
    except Exception as ex:
        logging.error("Error Occurred Adding Row: \n" + str(ex))

# Main
while(True):
    if (dbCon == None):
        connectDB()
        logging.info("Connected to DB")
    else:
        message = bus.recv()
        if message != None:
            logging.debug("Message Recieved on CAN bus")            
            hexData = ''.join(format(byte, '02X') for byte in message.data)
            logging.debug(hexData)            
            timestamp = message.timestamp
            canId = message.arbitration_id            
            addDB(canId, timestamp, hexData)