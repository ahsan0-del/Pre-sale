// Contract Configuration
const contractAddress = "0xYOUR_CONTRACT_ADDRESS";
const contractABI = [PASTE_YOUR_ABI_HERE];

// DOM Elements
const connectBtn = document.getElementById("connect-btn");
const enterBtn = document.getElementById("enter-btn");
const walletStatus = document.getElementById("wallet-status");
const currentPoolEl = document.getElementById("current-pool");
const participantsEl = document.getElementById("participants");
const lastWinnerEl = document.getElementById("last-winner");
const winnerBanner = document.getElementById("winner-banner");
const winnerAddressEl = document.getElementById("winner-address");
const prizeAmountEl = document.getElementById("prize-amount");

// App State
let provider, signer, contract, userAddress;

// Initialize
window.addEventListener('load', async () => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) await handleWalletConnected(accounts[0]);
        
        window.ethereum.on('accountsChanged', (accounts) => {
            accounts.length > 0 ? handleWalletConnected(accounts[0]) : handleWalletDisconnected();
        });
    } else {
        connectBtn.textContent = "Install MetaMask";
        connectBtn.onclick = () => window.open("https://metamask.io/download.html");
    }
});

// Connect Wallet
connectBtn.addEventListener('click', async () => {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await handleWalletConnected(accounts[0]);
    } catch (error) {
        alert("Failed to connect: " + error.message);
    }
});

// Enter Lottery
enterBtn.addEventListener('click', async () => {
    if (!contract) return alert("Connect wallet first!");
    
    try {
        enterBtn.disabled = true;
        enterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';
        
        const tx = await contract.enter({ 
            value: ethers.utils.parseEther("0.025") 
        });
        await tx.wait();
        alert("You're in the lottery!");
        updateContractData();
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        enterBtn.disabled = false;
        enterBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> BUY TICKET';
    }
});

// Handle Wallet Connected
async function handleWalletConnected(account) {
    userAddress = account;
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    connectBtn.style.display = 'none';
    walletStatus.innerHTML = `<i class="fas fa-wallet"></i> ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    walletStatus.classList.add('connected');
    
    if (await contract.admin() === userAddress) {
        const adminBtn = document.createElement('button');
        adminBtn.className = 'neon-button';
        adminBtn.innerHTML = '<i class="fas fa-crown"></i> DRAW WINNER';
        adminBtn.onclick = drawWinner;
        enterBtn.after(adminBtn);
    }
    
    updateContractData();
    contract.on("NewEntry", updateContractData);
    contract.on("WinnerSelected", (winner, prize) => showWinner(winner, prize));
}

// Update Contract Data
async function updateContractData() {
    if (!contract) return;
    
    const pool = await contract.currentPool();
    const participants = (await contract.getParticipants()).length;
    const lastWinner = (await contract.lastWinner()) || "TBD";
    
    currentPoolEl.textContent = ethers.utils.formatEther(pool) + " ETH";
    participantsEl.textContent = participants;
    lastWinnerEl.textContent = lastWinner === "TBD" ? "TBD" : `${lastWinner.slice(0, 6)}...${lastWinner.slice(-4)}`;
}

// Show Winner
function showWinner(winner, prize) {
    winnerAddressEl.textContent = `${winner.slice(0, 6)}...${winner.slice(-4)}`;
    prizeAmountEl.textContent = ethers.utils.formatEther(prize);
    winnerBanner.classList.remove('hidden');
    
    const confetti = new ConfettiGenerator({
        target: 'confetti',
        max: 150,
        size: 1.5
    });
    confetti.render();
    
    setTimeout(() => confetti.clear(), 5000);
}
