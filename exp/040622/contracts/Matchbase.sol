//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./OwnableExt.sol";
import "./Rando.sol";

contract Matchbase is OwnableExt {
	address payable internal externalWallet;
	Rando internal rando;

	enum MatchStatus {
		NotStarted,
		Started,
		Finished
	}

	struct MatchInfo {
		MatchStatus matchStatus;
		uint timeStarted;
		uint duration;
		uint floorPrice;
		uint maxSlotsPerWallet;
		address startedBy;
	}

	struct DepositInfo {
		uint depositAmount;
		uint slots;
		bool deposited;
	}

	mapping(string => MatchInfo) internal matches;
	mapping(string => mapping(address => DepositInfo)) internal deposits;
	mapping(string => address[]) internal players;
	mapping(string => mapping(address => uint)) internal wallets;
	mapping(string => string) internal randomSeeds;
	mapping(string => uint) internal prizePools;
	mapping(string => mapping(address => uint)) internal winnings;
	mapping(string => mapping(address => uint)) internal claims;

	event MatchStarted(string, uint);
	event WalletChanged(address, address);
	event FeeDeposited(string, address, uint);
	event WinnerPicked(string, address, uint, uint);
	event PrizeClaimed(string, address, uint);

	constructor(address payable _wallet) OwnableExt() {
		rando = new Rando();
		externalWallet = _wallet;
	}

	/**
        modifiers
     */

	modifier seedLength(string calldata seed) {
		uint length = bytes(seed).length;
		require(length > 5 && length < 10, "seed length");
		_;
	}

	modifier ownerOrStarter(string calldata _gameId) {
		require(super.isOwner(msg.sender) || matches[_gameId].startedBy == msg.sender, "only owner or starter");
		_;
	}

	/**
        property getters/setters
    */

	function setWallet(address payable _wallet) public onlyOwner {
		address oldWallet = externalWallet;
		externalWallet = _wallet;
		emit WalletChanged(externalWallet, oldWallet);
	}

	function getMatchStatus(string calldata _gameId) public view returns (MatchStatus) {
		return matches[_gameId].matchStatus;
	}

	function getFloorPrice(string calldata _gameId) public view returns (uint) {
		return matches[_gameId].floorPrice;
	}

	function getDepositInfo(string calldata _gameId, address by) public view returns (DepositInfo memory) {
		return deposits[_gameId][by];
	}

	function getPlayers(string calldata _gameId) public view returns (address[] memory) {
		return players[_gameId];
	}

	function getPrizePool(string calldata _gameId) public view returns (uint) {
		return prizePools[_gameId];
	}

	function getPrizeAmount(string calldata _gameId, address _winner) public view returns (uint) {
		return winnings[_gameId][_winner];
	}

	function getBalance() public view returns (uint) {
		return address(this).balance;
	}

	function verifyClaim(string calldata _gameId, address _winner) public view returns (bool) {
		require(getPrizeAmount(_gameId, _winner) > 0, "no prize");
		require(claims[_gameId][_winner] > 0, "can't claim");
		return true;
	}
}