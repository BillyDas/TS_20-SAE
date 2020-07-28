from datetime import datetime, timedelta
import random
import time
import mysql.connector

# define dummy data to be added
# ENSURE ANY COLUMN DEFINED BY CAPS IN ASSOCIATED COMMENT HAS AN EXACT MATCHING ENTRY IN THE PREVIOUS TABLE
# these are used to join the data together to adhere to FK restraints

# define sensor units
sensor_units = [
    # sensor unit description, sensor unit
    ('acceleration', 'g'),
    ('degrees per second', 'deg/s')
]

# define types of sensors
sensor_types = [
    # sensor type, SENSOR UNIT
    ['G-Force (Acceleration) Sensor', 'g'],
    ['Gyroscopic (Rotation) Sensor', 'deg/s']
]

# define sensors in the system
sensors = [
    # can id-n, specific sensor name, SENSOR TYPE
    ["0x610-0", "X axis G-Force (Acceleration) Sensor", "G-Force (Acceleration) Sensor"],
    ["0x610-1", "Y axis G-Force (Acceleration) Sensor", "G-Force (Acceleration) Sensor"],
    ["0x610-2", "Z axis G-Force (Acceleration) Sensor", "G-Force (Acceleration) Sensor"],
    ["0x611-0", "X axis Gyroscopic (Rotation) Sensor", "Gyroscopic (Rotation) Sensor"],
    ["0x611-1", "Y axis Gyroscopic (Rotation) Sensor", "Gyroscopic (Rotation) Sensor"],
    ["0x611-2", "Z axis Gyroscopic (Rotation) Sensor", "Gyroscopic (Rotation) Sensor"]
]

# define number of runs to emulate
now = datetime.utcnow()
fake_runs = [
    # start of run, end of run
    [now - timedelta(hours=15), now - timedelta(hours=15) + timedelta(minutes=7)],
    # a 7 minute run, starting 15 hours ago
    [now - timedelta(hours=4) - timedelta(minutes=35), now - timedelta(hours=4)],
    # a 35 minute run, starting 4 hours and 35 minutes ago
    [now - timedelta(minutes=20), now]  # a 20 minute run, starting 20 minutes ago
]

# define how often we receive data from the sensors
data_received_rate = 250  # in milliseconds


# define how data is generated for each sensor type
def generate_data_by_type(sensor_type):
    if sensor_type == "G-Force (Acceleration) Sensor":
        # return random value with 3 decimal places between -16 and 16
        return str(random.randint(-16000, 16000) / 1000)
    elif sensor_type == "Gyroscopic (Rotation) Sensor":
        # return weighted random value with 1 decimal place between -500 and 500 (?? values not specified in data sheet)
        random_minor_rotation = random.randint(1, 100) / 10
        random_medium_rotation = random.randint(101, 1000) / 10
        random_major_rotation = random.randint(1001, 5001) / 10
        spin_list = [random_minor_rotation] * 50 + [random_medium_rotation] * 15 + [random_major_rotation] * 1
        spin_data = random.choice(spin_list)
        if bool(random.getrandbits(1)):
            spin_data = -spin_data
        return str(spin_data)
    else:
        return ""


# end of modifications section, avoid changing anything below


def print_table_over_rows(table):
    for x in table:
        print("\t" + str(x))


def clear_tables():
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    cursor.execute("TRUNCATE Sensors")
    cursor.execute("TRUNCATE SensorType")
    cursor.execute("TRUNCATE SensorUnit")
    cursor.execute("TRUNCATE SensorData")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    connection.commit()


def create_SensorUnit():
    populate_SensorUnit_query = "INSERT INTO SensorUnit (`UnitName`, `UnitMetric`) VALUES (%s, %s) "
    cursor.executemany(populate_SensorUnit_query, sensor_units)
    print_table_over_rows(sensor_units)
    connection.commit()


def create_SensorType():
    cursor.execute("SELECT * FROM SensorUnit")
    available_units = cursor.fetchall()

    linked_sensor_types = [
        (sensor_type[0], available_unit[0])
        for sensor_type in sensor_types
        for available_unit in available_units
        if sensor_type[1] == available_unit[2].decode()
    ]

    populate_SensorType_query = "INSERT INTO SensorType (Description, UnitId) VALUES (%s, %s) "
    cursor.executemany(populate_SensorType_query, linked_sensor_types)
    print_table_over_rows(linked_sensor_types)
    connection.commit()


def create_Sensors():
    cursor.execute("SELECT * FROM SensorType")
    available_types = cursor.fetchall()

    linked_sensors = [
        (sensor[0], sensor[1], available_type[0])
        for sensor in sensors
        for available_type in available_types
        if sensor[2] == available_type[1].decode()
    ]

    populate_Sensors_query = "INSERT INTO Sensors (CanId, Name, SensorTypeId) VALUES (%s, %s, %s)"
    cursor.executemany(populate_Sensors_query, linked_sensors)
    print_table_over_rows(linked_sensors)
    connection.commit()


def create_SensorData():
    time.strftime('%Y-%m-%d %H:%M:%S')
    cursor = connection.cursor(buffered=True)

    generated_data = []
    for run in fake_runs:
        start_time, end_time = run
        while start_time < end_time:
            for sensor in sensors:
                data = generate_data_by_type(sensor[2])
                print("\t" + str((sensor[0], data, str(start_time))))
                generated_data.append((sensor[0], data, str(start_time)))
            start_time = start_time + timedelta(milliseconds=data_received_rate)

    print("GEE WHIZ THAT'S A LOT OF DATA... GIVE ME A SEC...", end=" ")
    populate_SensorData_query = "INSERT INTO SensorData (CanId, Data, UTCTimestamp) VALUES (%s, %s, %s)"
    cursor.executemany(populate_SensorData_query, generated_data)
    connection.commit()


# connect to database
print("CONNECTING TO DATABASE...", end=" ")
connection = mysql.connector.connect(
    host="ts20.billydasdev.com",
    user="ts20",
    passwd="ts20",
    port="3306",
    db="ts20"
)
cursor = connection.cursor(prepared=True)
print("CONNECTED!")

# generate everything!
print("CLEARING EXISTING DATA...", end=" ")
clear_tables()
print("CLEARED!")
print("INSERTING TO SensorUnit TABLE:")
create_SensorUnit()
print("INSERTING TO SensorType TABLE:")
create_SensorType()
print("INSERTING TO Sensors TABLE:")
create_Sensors()
print("INSERTING TO SensorData TABLE:")
create_SensorData()
print("DONE!")
