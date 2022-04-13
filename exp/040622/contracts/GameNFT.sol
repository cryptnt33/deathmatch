//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameNft is ERC721, Ownable {
    address private _contractOwner;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint private _floorPrice;
    uint private _mintLimit;
    uint private _maxSupply;

    constructor(
        uint floorPrice,
        uint mintLimit,
        uint maxSupply
    ) ERC721("GameNFT", "DM") {
        _floorPrice = floorPrice;
        _mintLimit = mintLimit;
        _maxSupply = maxSupply;
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

    function mintNft() public returns (uint) {
        _tokenIds.increment();
        uint tokenId = _tokenIds.current();
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    function mintNfts(uint8 count) public {
        require(count < _mintLimit, "_mintLimit exceeded");
        for (uint i = 0; i < count; i++) {
            _tokenIds.increment();
            uint tokenId = _tokenIds.current();
            _safeMint(msg.sender, tokenId);
        }
    }
}
