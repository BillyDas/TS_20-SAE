import sys
import ac
import acsys
from datetime import datetime, timedelta
import time


l_velocity = 0
last_rec = 0
f = None
first = True

def clamp(n, minn, maxn):
    return max(min(maxn, n), minn)


def acMain(ac_version):
    global l_velocity, f
    time.strftime('%Y-%m-%d %H:%M:%S')
    app_name = "SAE Dummy Data Generator"
    app_window = ac.newApp(app_name)
    ac.setSize(app_window, 200, 200)

    l_velocity = ac.addLabel(app_window, "Velocity: --")
    ac.setPosition(l_velocity, 3, 30)
    
    f = open('apps\python\SAE\dummydata.txt', 'w')
    f.write('INSERT INTO SensorData (CanId, Data, UTCTimestamp) VALUES')
    
    # ac.console("CONNECTING TO DATABASE...")
    # connection = connector.connect(
    #    host="ts20.billydasdev.com",
    #    user="ts20",
    #    passwd="ts20",
    #    port="3306",
    #    db="ts20"
    # )
    # cursor = connection.cursor(prepared=True)
    # ac.console("CONNECTED!")

    return app_name


def acUpdate(deltaT):
    global l_velocity, last_rec, f, first
    curr_milliseconds = time.time() * 1000

    if curr_milliseconds - last_rec >= 250:
        if first:
            first = False
        else:
            f.write(',')
    
        last_rec = curr_milliseconds
        
        timestamp = datetime.utcnow()
        
        acceleration_g = ac.getCarState(0, acsys.CS.AccG)
        local_angular_velocity = ac.getCarState(0, acsys.CS.LocalAngularVelocity)
        
        ac.setText(l_velocity, "Velocity: {}".format(acceleration_g))   

        f.write('\n\t("0x610-0", "' + str(clamp(acceleration_g[0], -16, 16)) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x610-1", "' + str(clamp(acceleration_g[1], -16, 16)) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x610-2", "' + str(clamp(acceleration_g[2], -16, 16)) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-0", "' + str(local_angular_velocity[0]) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-1", "' + str(local_angular_velocity[1]) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-2", "' + str(local_angular_velocity[2]) + '", "' + str(timestamp) + '")')
        
        
def acShutdown():
    global f
    if f:
        f.close()