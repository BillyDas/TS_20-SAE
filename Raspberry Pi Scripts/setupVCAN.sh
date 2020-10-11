#!/bin/sh
echo "Setting Up Virtual Can Bus"
sudo modprobe vcan
sudo ip link add dev can0 type vcan
sudo ip link set up can0
echo "Done"
