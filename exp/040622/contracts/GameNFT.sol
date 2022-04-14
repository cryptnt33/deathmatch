//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./OwnableExt.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameNft is ERC721, OwnableExt {
    address private _treasuryAddress;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint private _floorPrice;
    uint private _mintLimit;
    uint private _maxSupply;

    constructor() ERC721("Game", "DM") {}

    modifier canMint(uint count) {
        require(count > 0, "zero requested");
        require(count <= _mintLimit, "too many requested");
        require(count + getCurrentSupply() < _maxSupply, "exceeds max supply");
        _;
    }

    function setFloorPrice(uint floorPrice) public onlyOwner {
        _floorPrice = floorPrice;
    }

    function setMintLimit(uint mintLimit) public onlyOwner {
        _mintLimit = mintLimit;
    }

    function setMaxSupply(uint maxSupply) public onlyOwner {
        _maxSupply = maxSupply;
    }

    function getFloorPrice() public view returns (uint) {
        return _floorPrice;
    }

    function getMaxSupply() public view returns (uint) {
        return _maxSupply;
    }

    function getMintLimit() public view returns (uint) {
        return _mintLimit;
    }

    function getCurrentSupply() public view returns (uint) {
        return _tokenIds.current();
    }

    function isContractOwner(address _address) public view returns (bool) {
        return isOwner(_address);
    }

    function mintNft() private canMint(1) {
        _tokenIds.increment();
        uint tokenId = _tokenIds.current();
        _safeMint(msg.sender, tokenId);
    }

    function mintNfts(uint count) public payable canMint(count) {
        require(msg.value >= count * _floorPrice, "insufficient ethers");
        for (uint i = 0; i < count; i++) {
            mintNft();
        }
    }
}
