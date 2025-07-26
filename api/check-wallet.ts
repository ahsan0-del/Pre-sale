// This is a mock backend API handler for wallet confirmation
export default function handler(req, res) {
  if (req.method === "POST") {
    const { walletAddress } = req.body;

    // Fake sample wallet confirmations
    const confirmedWallets = [
      "0x1234567890123456789012345678901234567890",
      "0x0987654321098765432109876543210987654321",
      "0xdf21b5046cdd2ee9d7ddd2a6f8c01d5676997762" // your real one
    ];

    const isConfirmed = confirmedWallets.includes(walletAddress.toLowerCase());

    return res.status(200).json({ confirmed: isConfirmed });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
