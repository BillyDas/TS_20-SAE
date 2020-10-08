import can
import struct

can_interface = 'can0'
bus = can.interface.Bus(can_interface, bustype='socketcan')
while(True):
    message = bus.recv()
    if message != None:
        unpacked = struct.unpack_from("<f", message.data, 0)
        print(str(message.timestamp) + '-' + str(message.arbitration_id) + '-' + str(tuple(unpacked)[0]))
