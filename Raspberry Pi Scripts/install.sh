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
    echo -e "${RED}[DPND]Python 3 pip Not installed, Please Install.${NOCOLOR}" >&2
    exit 1
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
sudo apt-get install mariadb-server -y > /dev/null
echo -e "${GREEN}Installed MariaDB${NOCOLOR}"



