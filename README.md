# HFC2ETH
HFC to ETH web3 bindings, solidity contract, and google audit

## To setup HFC2ETH in Ubuntu 18.04

1. $ sudo apt update -y && sudo apt upgrade -y
2. $ sudo apt install git wget libcanberra-gtk-module libcanberra-gtk3-module
3. $ git clone https://github.com/seanjones2848/HFC2ETH.git
4. $ curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
5. $ npm install -g npm
6. $ wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
7. $ sudo dpkg -i google-chrome-stable_current_amd64.deb
8. $ git clone https://github.com/trufflesuite/ganache.git
9. $ cd ganache && npm run build-linux && npm install && npm start
10. In ganache make new workspace, change server port to 8545, hit save
11. Open chrome and get metamask plugin
12. In metamask import using account seed phrase, put in mnemonic from ganache, and create new password
13. In chrome navigate to https://remix.ethereum.org/
  - Select new compiler version "0.4.24+commit.e67f0147"
  - Open file in remix in ~/HFC2ETH/contract/simple.sol
  - Start to compile
  - Navigate to run tab
  - Hit Deploy and confirm in the pop up window
  - Copy address of contract
14. Go google spreadsheets
  - Name current sheet audit
    - In first row the columns should be named User Name, Amount Wei, Exchange Rate, Time Stamp, Wallet
  - Go to Tools > Script editor
  - Replace code with ~/HFC2ETH/googleScript/code.gs
  - Replace spreadsheetID with current spreadsheet ID found between .../d/ and /edit#... in google sheet url
  - Hit save
  - Go to Publish > Deploy as web app...
    - Who has access to the app should be set to Anyone, even anonymous
    - If you ever need to update, project version should always be set to new
15. Open up ~/HFC2ETH/frontend/web3_bindings.js
  - Replace var simpleContactAddress with new contract address in remix run tab
  - Replace var owner with first account addess in ganache
  - Replace const url in function auditToGoogle with new web app url after https://cors-anywhere.herokuapp.com/
16. Drag ~/HFC2ETH/frontend/index.html into browser

## To use HFC2ETH
- Inspect webpage and pull up in browser console
- Put in sample UserID, Wallet from any ganache address, and amount of ETH to send, and hit Submit
  - In console you should see an exchange rate, and a promise return, success!
- Hit Audit
  - In concole an array of transactions should be logged and a returned promise
  - In google sheets your transactions should be logged
- Hit Withdrawal
  - In console you should see return promise
  - Owner acount should increase by amount paid by sender
