import {useState} from "react";
import "./App.css";
import {ethers} from "ethers";
import Deathmatch from "./solidity/artifacts/contracts/Deathmatch.sol/Deathmatch.json";
import {OnboardingButton} from "./Components/OnboardingButton";
import {AddAvalancheButton} from "./Components/AddAvalancheButton";

const MatchContractAddress = "0xDA2b8ac3Ae992c2a2F51e4dFdf98070e62F91294";
const VrfContractAddress = "0xdFDC88a9c17479D0032158031F79fbf08126fBba";

const {v4: uuidv4} = require("uuid");

function addDays(duration) {
	return duration * 86400000 + Date.now();
}

function App() {
	const [error, setError] = useState();
	const [floorPrice, setFloorPrice] = useState(1);
	const [slots, setSlots] = useState(1);
	const [matchId] = useState(uuidv4());
	const [duration, setDuration] = useState(1);

	async function requestAccount() {
		try {
			await window.ethereum.request({method: "eth_requestAccounts"});
		} catch (e) {
			console.log(e);
			setError(e.message);
		}
	}

	async function startMatch() {
		await requestAccount();
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(MatchContractAddress, Deathmatch.abi, signer);
			contract.on("MatchStarted", (id, ts) => {
				console.log("MatchStarted triggered", id, ts);
			});
			// if the account is owner then set vrf contract address
			// set up an admin section
			const tx = await contract.startMatch(matchId, parseInt(floorPrice), parseInt(slots), addDays(parseInt(duration)));
			await tx.wait();
		} catch (e) {
			console.log(e);
			setError(e.message);
		}
	}

	return (
		<div>
			<div>
				<AddAvalancheButton provider={window.ethereum} />
			</div>
			<div>
				<OnboardingButton />
			</div>
			<div>
				<label>{error}</label>
			</div>
			<div>
				<h3>Start Match</h3>
				<label>Match ID: {matchId}</label>
				<div>
					<label>Floor price (Set the floor price in AVAX. This is the price of entry a player pays times the number of slots they purchase.)</label>
					<select onChange={setFloorPrice}>
						<option>1</option>
						<option>2</option>
						<option>3</option>
						<option>4</option>
						<option>5</option>
					</select>
				</div>
				<div>
					<label>Slots (Set the maximum number of slots per player per match. It increases a players chance to win. Its like buying more than 1 ticket to a lottery)</label>
					<select onChange={setSlots}>
						<option>1</option>
						<option>2</option>
						<option>3</option>
						<option>4</option>
						<option>5</option>
					</select>
				</div>
				<div>
					<label>Duration (in number of days)</label>
					<select onChange={setDuration}>
						<option>1</option>
						<option>2</option>
						<option>3</option>
					</select>
				</div>
				<div>
					<button onClick={startMatch}>Start Match</button>
				</div>
			</div>
			<div></div>
		</div>
	);
}

export default App;
