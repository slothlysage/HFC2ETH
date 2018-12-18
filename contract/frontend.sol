/********************************************

Front end contract under admin control

EIP712 typed signing Functions
    -multi-sig

Functions:
    -Pause/Unpause
    -Change Admin Addresses
    -Update/Revert Adress of payable(subordinate) contract
    -Stores addresses of any referenced contracts (variables)
    -Suicide
    -Withdraw to given address (and/or set default)

********************************************/

//!!! Need to find right pragma
pragma solidity ^0.4.xx;

contract FrontEnd {

    // setup the types for the message for hashing
    struct Identity {
        string userId;
        address wallet;
    }
    struct Trx {
        string currency;
        uint256 amount;
        uint256 trxid;
        Identity user;
    }
    string private constant IDENTITY_TYPE = "Identity(string userId,address wallet)";
    string private constant TRX_TYPE = "Trx(string currency,uint256 amount,uint256 trxid,Identity user)Identity(string userId,address wallet)";

    // setup the domain separator
    // chainId needs to match chain put on (1 for main net)
    uint256 constant chainId = 1;
    // need to get verifying contract address
    address constant verifyingContract = ;
    // need to get salt from multi-sig
    bytes32 constant salt = ;
    string private constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
    bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(
        EIP712_DOMAIN_TYPEHASH,
        keccak256("HFC2ETH"),
        keccak256("1"),
        chainId,
        verifyingContract,
        salt
    ));

    // hash function for each message data type
    function hashIdentity(Identity identity) private pure returns (bytes32) {
        return keccak256(abi.encode(
            IDENTITY_TYPEHASH,
            identity.userId,
            identity.wallet
        ));
    }
    function hashTrx(Trx memory trx) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\\x19\\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                TRX_TYPEHASH,
                keccak256(trx.currency),
                trx.amount,
                trx.trxid,
                hashIdentity(trx.user)
            ))
        ));
    }

    // signature verification function
    function verify(address signer, Trx memory trx, sigR, sigS, sigV) public pure returns (bool) {
        return signer == ecrecover(hashTrx(trx), sigV, sigR, sigS);
    }
}