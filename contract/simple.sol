/*
 * New contract with simple payable function and struct
 *
 *
*/

pragma solidity ^0.4.24;

contract Simple {

    // added in owner bindings
    address private _owner;
    
    constructor() public {
        _owner = msg.sender;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    // modifier to ensure only owner can run functions
    modifier onlyOwner() {
        assert(isOwner());
        _;
    }

    // event fired off in case of oracle
    event NewTransaction(uint256 trxId, string userId, uint256 exchangeRate, uint256 amountHFC, uint256 timeStamp);
    
    // struct used to keep track of transactions
    struct Transaction {
        string userId;
        uint256 exchangeRate;
        uint256 amountWei;
        uint256 timeStamp;
        address wallet;
    }
    
    // an array of all transactions that have occured
    Transaction[] _transactions;

    // function to reviece a transaction and log it
    // costs gas
    function recieveTrx(string _userId, uint256 _exchangeRate, uint256 _timeStamp) external payable {
        uint256 trxId = _transactions.push(Transaction(_userId, _exchangeRate, msg.value, _timeStamp, msg.sender)) - 1;
        emit NewTransaction(trxId, _userId, _exchangeRate, msg.value, _timeStamp);
    }

    // a function to chop up a string into two byte32s
    // used to pass out userIds from the contract
    // uses assembly for ease
    // free
    function _stringToBytes(string memory s) internal pure returns (bytes32, bytes32){
        bytes memory temp = bytes(s);
        bytes32 p1 = 0x0;
        bytes32 p2 = 0x0;
        if (temp.length <= 32) {
            assembly {
                p1 := mload(add(s, 32))
            }
        } else {
            bytes memory s2;
            for (uint i = 0; i < 32; i++) {
                s2[i] = temp[i + 32];
            }
            assembly {
                p1 := mload(add(s, 32))
                p2 := mload(add(s2, 32))
            }
        }
        return (p1, p2);
    }

    // function to see how much ETH is in this contract
    // only used by owner
    // free
    function viewBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    // used to withdraw all ether from this contract
    // can only be used by owner
    // costs gas
    function withdrawETH() external onlyOwner {
        uint256 amount = address(this).balance;
        _owner.transfer(amount);
    }
    
    // audit addresses in transactions in order of occurance
    // can only be used by owner
    // free
    function addressAudit() external view onlyOwner returns (address[]) {
        address[] memory addresses = new address[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            addresses[i] = _transactions[i].wallet;
        }
        return (addresses);
    }

    // audit userIds in transactions in order of occurance
    // returns two byte32 arrays, needs to be recombined after reciept
    // can only be used by owner
    // free
    function userIdAudit() external view onlyOwner returns (bytes32[], bytes32[]) {
        bytes32[] memory userIdp1 = new bytes32[](_transactions.length);
        bytes32[] memory userIdp2 = new bytes32[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            (userIdp1[i], userIdp2[i]) = _stringToBytes(_transactions[i].userId);
        }
        return (userIdp1, userIdp2);
        
    }

    // audit amouts paid in Wei in transactions in order of occurance
    // can only be used by owner
    // free
    function amountAudit() external view onlyOwner returns (uint256[]) {
        uint256[] memory amounts = new uint256[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            amounts[i] = _transactions[i].amountWei;
        }
        return (amounts);
    }

    // audit exchange rates in Wei/HFC in transactions in order of occurance
    // can only be used by owner
    // free
    function exchangeAudit() external view onlyOwner returns (uint256[]) {
        uint256[] memory exchanges = new uint256[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            exchanges[i] = _transactions[i].exchangeRate;
        }
        return (exchanges);
    }

    // audit epoch time stamps in transactions in order of occurance
    // can only be used by owner
    // free
    function timeAudit() external view onlyOwner returns (uint256[]) {
        uint256[] memory times = new uint256[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            times[i] = _transactions[i].timeStamp;
        }
        return (times);
    }

    // audit transaction IDs in transactions in order of occurance
    // can only be used by owner
    // free
    function trxIdAudit() external view onlyOwner returns (uint256[]) {
        uint256[] memory trxIds = new uint256[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            trxIds[i] = i;
        }
        return (trxIds);
    }

    // self destruct for taking out contract
    // only use at last resort
    // FUNDS SENT AFTER SELF DESTRUCT WILL BE LOST
    // can only be used by owner
    // negative gas cost
    function close() external onlyOwner {
        selfdestruct(_owner);
    }
}