//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./OwnableExt.sol";

contract Deathmatch is OwnableExt {
    address payable private wallet;

    enum MatchStatus {
        NotStarted,
        Started,
        Finished
    }

    struct MatchInfo {
        MatchStatus matchStatus;
        uint timeStarted;
        uint floorPrice;
    }

    struct DepositInfo {
        address by;
        uint amount;
    }

    mapping(string => MatchInfo) private matches;
    mapping(string => DepositInfo) private deposits;

    event MatchStarted(string, uint);
    event WalletChanged(address, address);
    event FeeDeposited(address, uint);

    constructor(address payable _wallet) OwnableExt() {
        wallet = _wallet;
    }

    function startMatch(string calldata _gameId, uint _floorPrice)
        external
        ownerOrDelegator
    {
        uint timestamp = block.timestamp;
        matches[_gameId] = MatchInfo(
            MatchStatus.Started,
            timestamp,
            _floorPrice
        );
        emit MatchStarted(_gameId, timestamp);
    }

    function depositFee(string calldata _gameId, uint _count) external payable {
        require(
            msg.value >= matches[_gameId].floorPrice * _count,
            "insufficient ethers"
        );
        deposits[_gameId] = DepositInfo(msg.sender, msg.value);
        // transfer to the wallet address
        wallet.transfer(msg.value);
        emit FeeDeposited(msg.sender, msg.value);
    }

    function setWallet(address payable _wallet) external onlyOwner {
        address oldWallet = wallet;
        wallet = _wallet;
        emit WalletChanged(wallet, oldWallet);
    }

    function getMatchStatus(string calldata _gameId)
        external
        view
        returns (MatchStatus)
    {
        return matches[_gameId].matchStatus;
    }

    function getFloorPrice(string calldata _gameId)
        external
        view
        returns (uint)
    {
        return matches[_gameId].floorPrice;
    }
}
