#############################################################
#   Asetto Corsa Telemetry to CAN v1.0.0
#   Author: Baylin Ferguson
#   Description: This software gathers the Telemetry from AC via UDP and pushes to the can bus
#############################################################
import socket
import logging
import struct
import can
import json

# Settings
acIP = "10.0.0.66"
acPort = 9996
logLevel = logging.INFO

# AC PACKET CONSTANTS
HANDSHAKE = 0
SUBSCRIBE_UPDATE = 1
SUBSCRIBE_SPOT = 3
DISMISS = 3

# Global Variables
state = HANDSHAKE
connected = False

# Setup Logging
logging.basicConfig(format='%(levelname)s:%(message)s', level=logLevel)

# Setup UDP Socket
client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client.bind(("0.0.0.0", acPort))

# Setup Can Bus
canbus = can.interface.Bus(channel='can0', bustype='socketcan')

# Send Message on Can Bus
def can_send(can_id, data):
    msg = can.Message(arbitration_id=can_id, data=data, is_extended_id=False)
    try:
        canbus.send(msg)
        return False
    except can.CanError:
        print("Error Sending Message on CAN bus")
        return True

# Read JSON config file
def getConfig():
    json_file = open("ac-telemetry-config.json")
    config = json.load(json_file)
    json_file.close()
    return config['sensors']

# Send UDP Packet to Asetto Corsa Server
def ac_send(op):
    msg = bytearray(12)
    msg.insert(0, 1) # identifier
    msg.insert(4, 1) # version
    msg.insert(8, op) # operation
    client.sendto(msg, (acIP, acPort))

# Read Float Little Endian from Message Buffer
def readFloatLE(msg, offset):
    unpacked = struct.unpack_from("<f", msg, offset)
    return tuple(unpacked)[0]

# Read Array of Float Little Endian from Message Buffer
def readFloatArr(msg, offset, num):
    res = list()
    for i in range(0, num):
        x = readFloatLE(msg, (offset + (4 * i)))
        res.insert(i, x)
    return res

# Handle Response from Handshake with AC
def handleHandshakeMessage(msg, addr):
    global connected
    logging.info("Recieved Handshake")
    connected = True
    
# Handle New Data Update from AC
def handleSubscribeUpdateMessage(msg, addr):
    logging.info("Recieved Subscribe Update Message")
    offset = 4
    config = getConfig()
    for sensor in config:
        if (sensor['numVals'] == 1):
            sensorData = readFloatLE(msg, offset * sensor['offset'])
            canMsg = struct.pack("<f", sensorData)
            errors = can_send(sensor['offset'], canMsg)
        else:
            sensorData = readFloatArr(msg, offset * sensor['offset'], sensor['numVals'])
            for i in range(0, sensor['numVals']):
                canMsg = struct.pack("<f", sensorData[i])
                errors = can_send(sensor['offset'] + i, canMsg)
    
# Main 
while True:        
    if (not connected):
        logging.info("Sending Handshake")
        ac_send(HANDSHAKE)
        msg, addr = client.recvfrom(1024)
        handleHandshakeMessage(msg, addr)
    if connected:
        if (state == HANDSHAKE):
            logging.info("Sending Subscribe Update")
            ac_send(SUBSCRIBE_UPDATE)
            state = SUBSCRIBE_UPDATE
        if (state == SUBSCRIBE_UPDATE):
            msg, addr = client.recvfrom(1024)
            handleSubscribeUpdateMessage(msg, addr)