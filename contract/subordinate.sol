/****************************************

Subordinate contract with payable public

Inputs:
    -HF User Name
    -User's wallet address
    -ETH amount (derived from recieved amount)
    -ETH/HFC exchange rate
    -Date/time of exchange (not transaction)

Triggers events with inputs

****************************************/

//!!! need to find out correct pragma
pragma solidity ^0.4.xx;

contract Subordinate {

    event NewTrx(
        string userId,
        address wallet,
        uint256 amount,
        uint256 exchangeRate,
        uint256 exchangeTime
    );

    struct Trx {
        string userId;
        address wallet;
        uint256 amount;
        uint256 exchangeRate;
        uint256 exchangeTime;
    }

    function _createTrx(string userId, address wallet, uint256 amount, uint256 exchangeRate, uint256 exchangeTime) private pure returns (Trx) {
        return (Trx(userId, wallet, amount, exchangeRate, exchangeTime));
    }

}