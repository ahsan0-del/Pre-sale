// Contract details (replace with yours)
const contractAddress = "0xYOUR_CONTRACT_ADDRESS";
const contractABI = [PASTE_YOUR_ABI_HERE]; // From Remix

let provider, signer, contract, userAddress;

// Connect Wallet
document.getElementById("connect-btn").addEventListener("click", async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            alert(`Connected: ${userAddress}`);
            updatePoolInfo();
        } catch (error) {
            alert("Error connecting: " + error.message);
        }
    } else {
        alert("Please install MetaMask!");
    }
});

// Enter Lottery
document.getElementById("enter-btn").addEventListener("click", async () => {
    if (!contract) {
        alert("Connect wallet first!");
        return;
    }
    
    try {
        const tx = await contract.enter({ value: ethers.utils.parseEther("0.0025") });
        await tx.wait();
        alert("You're in the lottery!");
        updatePoolInfo();
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// Draw Winner (Admin Only)
document.getElementById("draw-btn").addEventListener("click", async () => {
    if (!contract) {
        alert("Connect wallet first!");
        return;
    }
    
    try {
        const tx = await contract.drawWinner();
        await tx.wait();
        alert("Winner selected!");
        updatePoolInfo();
    } catch (error) {
        alert("Only admin can draw winner!");
    }
});

// Update Pool Info
async function updatePoolInfo() {
    const pool = await contract.currentPool();
    const participants = await contract.participants.length;
    
    document.getElementById("pool").textContent = ethers.utils.formatEther(pool) + " ETH";
    document.getElementById("participants").textContent = participants;
}
