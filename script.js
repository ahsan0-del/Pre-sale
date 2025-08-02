// Contract Configuration (Replace with your contract details)
const contractAddress = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
const contractABI = [PASTE_YOUR_ABI_HERE]; // From Remix IDE

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
    // Check if MetaMask is installed
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Check connection status
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            await handleWalletConnected(accounts[0]);
        }
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                handleWalletConnected(accounts[0]);
            } else {
                handleWalletDisconnected();
            }
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
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet: " + error.message);
    }
});

// Enter Lottery
enterBtn.addEventListener('click', async () => {
    if (!contract) {
        alert("Please connect your wallet first!");
        return;
    }
    
    try {
        enterBtn.disabled = true;
        enterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';
        
        const tx = await contract.enter({ 
            value: ethers.utils.parseEther("0.025") 
        });
        
        await tx.wait();
        alert("Success! You've entered the VIP lottery.");
        updateContractData();
    } catch (error) {
        console.error("Error entering lottery:", error);
        alert("Transaction failed: " + error.message);
    } finally {
        enterBtn.disabled = false;
        enterBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> BUY TICKET (0.025 ETH)';
    }
});

// Handle Wallet Connected
async function handleWalletConnected(account) {
    userAddress = account;
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Update UI
    connectBtn.style.display = 'none';
    walletStatus.innerHTML = `<i class="fas fa-wallet"></i> ${shortenAddress(userAddress)}`;
    walletStatus.classList.add('connected');
    
    // Check if admin
    const isAdmin = await contract.admin() === userAddress;
    if (isAdmin) {
        const adminBtn = document.createElement('button');
        adminBtn.id = 'admin-btn';
        adminBtn.className = 'cta-button secondary';
        adminBtn.innerHTML = '<i class="fas fa-crown"></i> DRAW WINNER';
        adminBtn.addEventListener('click', drawWinner);
        enterBtn.after(adminBtn);
    }
    
    // Load contract data
    updateContractData();
    
    // Listen for events
    contract.on("NewEntry", (participant) => {
        updateContractData();
    });
    
    contract.on("WinnerSelected", (winner, prize) => {
        showWinner(winner, prize);
        updateContractData();
    });
}

// Handle Wallet Disconnected
function handleWalletDisconnected() {
    userAddress = null;
    contract = null;
    
    // Update UI
    connectBtn.style.display = 'block';
    walletStatus.innerHTML = '<i class="fas fa-wallet"></i> Not Connected';
    walletStatus.classList.remove('connected');
    
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) adminBtn.remove();
}

// Update Contract Data
async function updateContractData() {
    if (!contract) return;
    
    try {
        const pool = await contract.currentPool();
        const participantCount = (await contract.getParticipants()).length;
        const lastWinner = await contract.lastWinner() || "TBD";
        
        currentPoolEl.textContent = ethers.utils.formatEther(pool) + " ETH";
        participantsEl.textContent = participantCount;
        lastWinnerEl.textContent = shortenAddress(lastWinner);
    } catch (error) {
        console.error("Error fetching contract data:", error);
    }
}

// Draw Winner (Admin Only)
async function drawWinner() {
    if (!contract) return;
    
    try {
        const adminBtn = document.getElementById('admin-btn');
        adminBtn.disabled = true;
        adminBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';
        
        const tx = await contract.drawWinner();
        await tx.wait();
    } catch (error) {
        console.error("Error drawing winner:", error);
        alert("Only admin can draw winner!");
    } finally {
        const adminBtn = document.getElementById('admin-btn');
        if (adminBtn) {
            adminBtn.disabled = false;
            adminBtn.innerHTML = '<i class="fas fa-crown"></i> DRAW WINNER';
        }
    }
}

// Show Winner with Confetti
function showWinner(winner, prize) {
    winnerAddressEl.textContent = shortenAddress(winner);
    prizeAmountEl.textContent = ethers.utils.formatEther(prize);
    winnerBanner.classList.remove('hidden');
    
    // Trigger confetti
    const confettiSettings = { target: 'confetti', max: 150, size: 1.5 };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
    
    setTimeout(() => {
        confetti.clear();
    }, 5000);
}

// Helper: Shorten Ethereum Address
function shortenAddress(address) {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "";
}
