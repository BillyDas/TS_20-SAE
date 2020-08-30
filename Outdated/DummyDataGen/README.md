# DummyDataGen

`smarterdummygen.py` generates and directly populates our database tables with dummy data.  
The kind of Sensors, Types, Units, and the Data being inserted can be modified within the python script as per the internal documentation.  
**DO NOT PUBLICISE THIS SCRIPT, IT CONTAINS AN UNENCRYPTED CONNECTION STRING.**  
**DO NOT RUN THIS SCRIPT IF YOU DO NOT WANT TO OVERWRITE THE DATABASE'S CURRENT DATA.**  

`dummygen.py` is not needed - it is an older version which creates SQL statements and prints them to output `.txt` files.

## Usage

Install Dependencies:
```bash
python -m pip install mysql-connector
```

Run:
```bash
python smarterdummygen.py
```



