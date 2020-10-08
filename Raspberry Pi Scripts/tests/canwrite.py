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
    while(errors == False):
        toSend = 0.000000
        msg = struct.pack("f", toSend)
        errors = can_send(0x3CB, msg)
        time.sleep(1)

if __name__ == '__main__':
    main()
