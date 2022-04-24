//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./OwnableExt.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameNft is ERC721, OwnableExt {
    // address private _treasuryAddress;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint private _floorPrice;
    uint private _mintLimit;
    uint private _maxSupply;

    event TransferFromCalled(
        address from,
        address to,
        uint256 tokenId,
        bytes _data
    );

    constructor() ERC721("Game", "DM") {}

    /***
    Area: private fields
     */

    /***
    Area: public fields
     */

    /***
    Area: getters
     */

    /***
    Area: setters
     */

    /***
    Area: private functions
     */

    /***
    Area: external functions
     */

    /***
    Area: public functions
     */

    /***
    Area: events
     */

    modifier canMint(uint count) {
        require(count > 0, "zero requested");
        require(count <= _mintLimit, "too many requested");
        require(count + _tokenIds.current() < _maxSupply, "exceeds max supply");
        _;
    }

    function setFloorPrice(uint floorPrice) public onlyOwner {
        _floorPrice = floorPrice;
    }

    // function setTreasuryAddress(address _address) public onlyOwner {
    //     _treasuryAddress = _address;
    // }

    function setMintLimit(uint mintLimit) public onlyOwner {
        _mintLimit = mintLimit;
    }

    function setMaxSupply(uint maxSupply) public onlyOwner {
        _maxSupply = maxSupply;
    }

    function getFloorPrice() public view returns (uint) {
        return _floorPrice;
    }

    function getMaxSupply() external view returns (uint) {
        return _maxSupply;
    }

    function getMintLimit() external view returns (uint) {
        return _mintLimit;
    }

    function getCurrentSupply() external view returns (uint) {
        return _tokenIds.current();
    }

    // function getTreasuryAddress() external view returns (address) {
    //     return _treasuryAddress;
    // }

    function isContractOwner(address _address) external view returns (bool) {
        return isOwner(_address);
    }

    function mintNft() private canMint(1) {
        _tokenIds.increment();
        uint tokenId = _tokenIds.current();
        super._safeMint(msg.sender, tokenId);
    }

    function mintNfts(uint count) external payable canMint(count) {
        for (uint i = 0; i < count; i++) {
            mintNft();
        }
    }

    // transfer token from one account to the other
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        this.safeTransferFrom(from, to, tokenId);
    }

    // transfer token from one account to the other
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        this.safeTransferFrom(from, to, tokenId, "");
    }

    // transfer token from one account to the other
    // transferring from one account to another is not supported atm
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(msg.sender == from, "only owner of the token can transfer");
        super.safeTransferFrom(from, to, tokenId, _data);
    }

    // transfer token from the player account to the treasury
    // this is one of the steps to enter a game
    // TODO: move this function to the game contract
    // function transferToTreasury(uint _tokenId) external {
    //     super.safeTransferFrom(msg.sender, _treasuryAddress, _tokenId);
    // }
}
