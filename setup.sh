#/bin/bash
# setup script for setting up ubuntu environment for HFC2ETH

sudo apt update -y && sudo apt upgrade -y
sudo apt install -y git wget curl libcanberra-gtk-module libcanberra-gtk3-module
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
rm -f google-chrome-stable_current_amd64.deb
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
npm install -g npm
git clone https://github.com/trufflesuite/ganache.git
cd ganache && npm run build-linux && npm install && npm start
sudo apt update -y && sudo apt upgrade -y