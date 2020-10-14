#############################################################
#   CANWrite v1.0.0
#   Author: Baylin Ferguson
#   Description: This software outputs a test message on the CAN bus to test the system
#############################################################
#!/usr/bin/env python3
# coding: utf-8
import can
import time
import struct

bus = can.interface.Bus(channel='can0', bustype='socketcan')

def can_send(can_id, data):
    msg = can.Message(arbitration_id=can_id, data=data, is_extended_id=False)
    try:
        bus.send(msg)
        return False
    except can.CanError:
        print("Error Sending Message on CAN bus")
        return True

def main():
    errors = False
    if(errors == False):
        #msg = struct.pack("BBBBBBBB", 1,2,3,4,5,6,7,8)
        msg = struct.pack("<f", 2.0)
        print(msg)
        errors = can_send(0x3CB, msg)
        time.sleep(1)

if __name__ == '__main__':
    main()
