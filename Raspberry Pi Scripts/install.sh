#!/bin/bash
#This script will install dependencies and install the required scripts for the TS20 Data Visualisation
#Version 1.0

#Define Colours for script
GREEN='\033[1;32m'
YELLOW='\033[0;31m'
RED='\033[0;31m'
LBLUE='\033[1;34m'
NOCOLOR='\033[0m'

#Print welcome and install script header
echo -e "${LBLUE}TS20 RPI Script Installer${NOCOLOR}"

#Ask user if they wish to install
while true; do
    read -p "Install Software and Dependencies? [y/N]" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo -e "${RED}Please answer yes [y] or no [N].${NOCOLOR}";;
    esac
done

#ensure user is superuser, if not exit
if [ $(id -u) != "0" ]; then
    echo -e "${RED}You must be the superuser to run this script${NOCOLOR}" >&1
    exit 1
fi

#ensure raspberry pi is up to date
echo -e "Updating Raspberry Pi"
apt-get update -y > /dev/null

#check that python3 is installed

if [[ ! -z $(which python3 | grep "/python3") ]]; then
    echo -e "${GREEN}Python 3 Installed${NOCOLOR}" >&1
else
    echo -e "${RED}Python 3 Not installed, Please Install.${NOCOLOR}" >&2
    exit 1
fi

#check that python3 pip is installed
if [[ ! -z $(which pip | grep "/pip") ]]; then
   echo -e "${GREEN}[DPND]Python 3 pip Installed${NOCOLOR}" >&1
else
    echo -e "${RED}[DPND]Python 3 pip Not installed, Attempting to Install.${NOCOLOR}" >&2
    apt-get install -y python3-pip > /dev/null
fi

#Download Master Repo from GitHub and Unzip
echo -e "Downloading and Unzipping Repo"
wget -nv https://github.com/wardude202/TS_20-SAE/archive/master.zip
unzip -q master.zip > /dev/null
rm -f master.zip > /dev/null
mv ./TS_20-SAE-master ./TS_20-SAE > /dev/null
find ./TS_20-SAE -mindepth 1 ! -regex '^./TS_20-SAE/Raspberry Pi Scripts\(/.*\)?' -delete > /dev/null

#Install python pip package requirements
echo -e "Installing Required Pip Packages"
pip3 install -r requirements.txt > /dev/null

#Set up Virtual CAN Bus
echo -e "Setting up Virtual CAN Bus"
modprobe vcan
ip link add dev vcan0 type vcan
ip link set vcan0 up

#Install Database
echo -e "Installing MariaDB"
[ ! -e /usr/bin/expect ] && { apt-get -y install expect > /dev/null; }
sudo apt-get install mariadb-server -y > /dev/null
echo -e "${GREEN}[DPND]MariaDB Installed${NOCOLOR}" >&1
echo -e "Configuring MariaDB"
MYSQL_ROOT_PASSWORD=TeamSwinburneFSAE2020!
SECURE_MYSQL=$(expect -c "
set timeout 10
spawn mysql_secure_installation
expect \"Enter current password for root (enter for none):\"
send \"$MYSQL\r\"
expect \"Change the root password?\"
send \"n\r\"
expect \"Remove anonymous users?\"
send \"y\r\"
expect \"Disallow root login remotely?\"
send \"y\r\"
expect \"Remove test database and access to it?\"
send \"y\r\"
expect \"Reload privilege tables now?\"
send \"y\r\"
expect eof
")
echo "$SECURE_MYSQL"
echo -e "${GREEN}Configured MariaDB${NOCOLOR}"

#Setup Database
echo -e "Setting up MariaDB"
mysql -u root -p $MYSQL_ROOT_PASSWORD ts20 < ts20.sql
echo -e "${GREEN}Database Configuration Complete${NOCOLOR}"

echo -e ""
echo -e ""
echo -e "${GREEN}######################################${NOCOLOR}"
echo -e ""
echo -e "${GREEN}Install Complete${NOCOLOR}"
echo -e ""
echo -e "${GREEN}######################################${NOCOLOR}"





