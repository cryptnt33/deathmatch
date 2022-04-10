//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

struct NFT {
    string nftId;
    uint timeAdded;
}
struct Console {
    string consoleId;
    uint timeCreated;
}
struct Asset {
    NFT[] nfts;
    Console[] consoles;
}

contract ComplexObject {
    mapping(address => Asset) private assets;
    address private contractOwner;

    constructor() {
        contractOwner = msg.sender;
    }

    function setNft(string memory _nftId, uint _timeAdded) public {
        Asset storage asset = assets[msg.sender];
        require(asset.nfts.length <= 500, "too many NFTs");
        asset.nfts.push(NFT(_nftId, _timeAdded));
    }

    function setConsole(string memory _consoleId, uint _timeCreated) public {
        Asset storage asset = assets[msg.sender];
        require(asset.consoles.length <= 500, "too many consoles");
        asset.consoles.push(Console(_consoleId, _timeCreated));
    }

    function getAsset() public view returns (Asset memory) {
        return assets[msg.sender];
    }
}
