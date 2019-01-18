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

    modifier onlyOwner() {
        assert(isOwner());
        _;
    }

    event NewTransaction(uint256 trxId, string userId, uint256 exchangeRate, uint256 amountHFC, uint256 timeStamp);
    
    struct Transaction {
        string userId;
        uint256 exchangeRate;
        uint256 amountWei;
        uint256 timeStamp;
        address wallet;
    }
    
    mapping (uint256 => address) transactionsToSender;
    mapping (address => uint256) userTransactionsCount;
    mapping (string => address[]) userToAddress;

    Transaction[] public _transactions;
    
    function recieveTrx(string _userId, uint256 _exchangeRate, uint256 _timeStamp) external payable {
        uint256 trxId = _transactions.push(Transaction(_userId, _exchangeRate, msg.value, _timeStamp, msg.sender)) - 1;
        transactionsToSender[trxId] = msg.sender;
        userTransactionsCount[msg.sender] += 1;
        uint newFlag = 1;
        for (uint i = 0; i < userToAddress[_userId].length; i++) {
            if (msg.sender == userToAddress[_userId][i]) {
                newFlag = 0;
            }
        }
        if (newFlag == 1) {
            userToAddress[_userId].push(msg.sender);
        }
        emit NewTransaction(trxId, _userId, _exchangeRate, msg.value, _timeStamp);
    }

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

    function viewBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function withdrawETH() external onlyOwner {
        uint256 amount = address(this).balance;
        _owner.transfer(amount);
    }
    
    function addressAudit() external view onlyOwner returns (address[]) {
        address[] memory addresses = new address[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            addresses[i] = _transactions[i].wallet;
        }
        return (addresses);
    }
    
    function userIdAudit() external view onlyOwner returns (bytes32[], bytes32[]) {
        bytes32[] memory userIdp1 = new bytes32[](_transactions.length);
        bytes32[] memory userIdp2 = new bytes32[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            (userIdp1[i], userIdp2[i]) = _stringToBytes(_transactions[i].userId);
        }
        return (userIdp1, userIdp2);
        
    }
    
    function amountAudit() external view onlyOwner returns (uint256[]) {
        uint256[] memory amounts = new uint256[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            amounts[i] = _transactions[i].amountWei;
        }
        return (amounts);
    }
    
    function exchangeAudit() external view onlyOwner returns (uint256[]) {
        uint256[] memory exchanges = new uint256[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            exchanges[i] = _transactions[i].exchangeRate;
        }
        return (exchanges);
    }
    
    function timeAudit() external view onlyOwner returns (uint256[]) {
        uint256[] memory times = new uint256[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            times[i] = _transactions[i].timeStamp;
        }
        return (times);
    }

    function trxIdAudit() external view onlyOwner returns (uint256[]) {
        uint256[] memory trxIds = new uint256[](_transactions.length);
        for (uint256 i = 0; i < _transactions.length; i++) {
            trxIds[i] = i;
        }
        return (trxIds);
    }
}