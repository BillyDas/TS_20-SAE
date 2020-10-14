#############################################################
#   CANListener v1.0.0
#   Author: Baylin Ferguson
#   Description: This software listens on the CAN bus and prints the messages recieved
#############################################################
import can
import struct

can_interface = 'can0'
bus = can.interface.Bus(can_interface, bustype='socketcan')
while(True):
    message = bus.recv()
    if message != None:
        unpacked = struct.unpack_from("<f", message.data, 0)
        print(str(message.timestamp) + '-' + str(message.arbitration_id) + '-' + str(tuple(unpacked)[0]))
