from datetime import datetime, timedelta
import random
import time


def populate_sensor_unit(f):
    sensor_units = [
        ["acceleration", "g"],
        ["degrees per second", "deg/s"]
    ]

    f.write('INSERT INTO SensorUnit (UnitName, UnitMetric) VALUES')
    first = True
    for unit in sensor_units:
        if first:
            first = False
        else:
            f.write(',')
        f.write('\n\t("' + unit[0] + '", "' + unit[1] + '")')
    f.write(';\n\n')


def populate_sensor_type(f):
    sensor_types = [
        ["G-Force (Acceleration) Sensor", "1"],
        ["Gyroscopic (Rotation) Sensor", "2"]
    ]

    f.write('INSERT INTO SensorType (Description, UnitId) VALUES')
    first = True
    for types in sensor_types:
        if first:
            first = False
        else:
            f.write(',')
        f.write('\n\t("' + types[0] + '", "' + types[1] + '")')
    f.write(';\n\n')


def populate_sensors(f):
    sensors = [
        ["0x610-0", "X axis G-Force (Acceleration) Sensor", "1"],
        ["0x610-1", "Y axis G-Force (Acceleration) Sensor", "1"],
        ["0x610-2", "Z axis G-Force (Acceleration) Sensor", "1"],
        ["0x611-0", "X axis Gyroscopic (Rotation) Sensor", "2"],
        ["0x611-1", "Y axis Gyroscopic (Rotation) Sensor", "2"],
        ["0x611-2", "Z axis Gyroscopic (Rotation) Sensor", "2"],
    ]

    f.write('INSERT INTO Sensors (CanId, Name, SensorTypeId) VALUES')
    first = True
    for sensor in sensors:
        if first:
            first = False
        else:
            f.write(',')
        f.write('\n\t("' + sensor[0] + '", "' + sensor[1] + '", "' + sensor[2] + '")')
    f.write(';\n\n')

def spin_gen():
    random_minor_spin = random.randint(1, 100) / 10
    random_medium_spin = random.randint(101, 1000) / 10
    random_major_spin = random.randint(1001, 5001) / 10
    spin_list = [random_minor_spin] * 50 + [random_medium_spin] * 15 + [random_major_spin] * 1
    spin_data = random.choice(spin_list)
    if bool(random.getrandbits(1)):
        spin_data = -spin_data

    return spin_data


def populate_sensor_data(f):
    f.write('INSERT INTO SensorData (CanId, Data, UTCTimestamp) VALUES')

    starting_timestamp = datetime.utcnow()
    older_timestamp = starting_timestamp - timedelta(minutes=40)

    first = True
    i = 0
    while i < 6000:
        if first:
            first = False
        else:
            f.write(',')

        # random accel xyz reading
        x_accel_data = random.randint(-16000, 16000) / 1000
        y_accel_data = random.randint(-16000, 16000) / 1000
        z_accel_data = random.randint(-16000, 16000) / 1000

        # random spin xyz reading
        x_spin_data = spin_gen()
        y_spin_data = spin_gen()
        z_spin_data = spin_gen()

        timestamp = older_timestamp + timedelta(milliseconds=100*i)
        f.write('\n\t("0x610-0", "' + str(x_accel_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x610-1", "' + str(y_accel_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x610-2", "' + str(z_accel_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-0", "' + str(x_spin_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-1", "' + str(y_spin_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-2", "' + str(z_spin_data) + '", "' + str(timestamp) + '")')
        # print('1x ' + str(i) + ':: ' + str(timestamp) + ' -- ' + str(accel_data) + ' -- ' + str(spin_data))
        i += 1

    i = 0
    while i < 6000:
        if first:
            first = False
        else:
            f.write(',')

        # random accel xyz reading
        x_accel_data = random.randint(-16000, 16000) / 1000
        y_accel_data = random.randint(-16000, 16000) / 1000
        z_accel_data = random.randint(-16000, 16000) / 1000

        # random spin xyz reading
        x_spin_data = spin_gen()
        y_spin_data = spin_gen()
        z_spin_data = spin_gen()

        timestamp = starting_timestamp + timedelta(milliseconds=100*i)
        f.write('\n\t("0x610-0", "' + str(x_accel_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x610-1", "' + str(y_accel_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x610-2", "' + str(z_accel_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-0", "' + str(x_spin_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-1", "' + str(y_spin_data) + '", "' + str(timestamp) + '"),')
        f.write('\n\t("0x611-2", "' + str(z_spin_data) + '", "' + str(timestamp) + '")')
        # print('1x ' + str(i) + ':: ' + str(timestamp) + ' -- ' + str(accel_data) + ' -- ' + str(spin_data))
        i += 1

    f.write(';\n\n')


file = open("output.txt", "w")
populate_sensor_unit(file)
populate_sensor_type(file)
populate_sensors(file)
file.close()

time.strftime('%Y-%m-%d %H:%M:%S')
file = open("output2.txt", "w")
populate_sensor_data(file)
file.close()
