import { ethers } from "ethers";

const LOCUS_TOKEN_ADDRESS = "0xc64500dd7b0f1794807e67802f8abbf5f8ffb054";
const LOCUS_DECIMALS = 18;

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export class LocusPaymentService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private locusContract: ethers.Contract;
  private ownerAddress: string;

  constructor() {
    if (!process.env.LOCUS_OWNER_KEY || !process.env.LOCUS_PRIVATE_KEY) {
      throw new Error("LOCUS_OWNER_KEY and LOCUS_PRIVATE_KEY environment variables are required");
    }

    this.ownerAddress = process.env.LOCUS_OWNER_KEY;
    this.provider = new ethers.JsonRpcProvider("https://ethereum-rpc.publicnode.com");
    this.wallet = new ethers.Wallet(process.env.LOCUS_PRIVATE_KEY, this.provider);
    this.locusContract = new ethers.Contract(LOCUS_TOKEN_ADDRESS, ERC20_ABI, this.wallet);
  }

  async getUsdToLocusRate(): Promise<number> {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=locus-chain&vs_currencies=usd"
    );
    const data = await response.json();
    const locusUsdPrice = data["locus-chain"]?.usd || 0.012;
    return locusUsdPrice;
  }

  async convertUsdToLocus(usdAmount: number): Promise<string> {
    const locusUsdRate = await this.getUsdToLocusRate();
    const locusAmount = usdAmount / locusUsdRate;
    return locusAmount.toFixed(2);
  }

  async chargeUser(
    userWalletAddress: string,
    usdAmount: number
  ): Promise<{ success: boolean; txHash?: string; error?: string; locusAmount: string }> {
    try {
      const locusAmount = await this.convertUsdToLocus(usdAmount);
      const amountInWei = ethers.parseUnits(locusAmount, LOCUS_DECIMALS);

      const userBalance = await this.locusContract.balanceOf(userWalletAddress);
      
      if (userBalance < amountInWei) {
        return {
          success: false,
          error: `Insufficient LOCUS balance. Required: ${locusAmount} LOCUS (~$${usdAmount.toFixed(2)} USD)`,
          locusAmount,
        };
      }

      return {
        success: true,
        error: "Payment would require user to send transaction from their wallet. This requires user approval.",
        locusAmount,
      };
    } catch (error: any) {
      console.error("[LocusPayment] Charge error:", error.message);
      return {
        success: false,
        error: error.message,
        locusAmount: "0",
      };
    }
  }

  async receivePayment(
    txHash: string
  ): Promise<{ success: boolean; from?: string; amount?: string; error?: string }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { success: false, error: "Transaction not found or still pending" };
      }

      if (receipt.status === 0) {
        return { success: false, error: "Transaction failed" };
      }

      const transferEvents = receipt.logs
        .filter((log) => log.address.toLowerCase() === LOCUS_TOKEN_ADDRESS.toLowerCase())
        .map((log) => {
          try {
            return this.locusContract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data,
            });
          } catch {
            return null;
          }
        })
        .filter((event) => event !== null);

      const transferToOwner = transferEvents.find(
        (event) =>
          event?.name === "Transfer" &&
          event.args.to.toLowerCase() === this.ownerAddress.toLowerCase()
      );

      if (!transferToOwner) {
        return {
          success: false,
          error: "No LOCUS transfer to owner address found in transaction",
        };
      }

      const amount = ethers.formatUnits(transferToOwner.args.value, LOCUS_DECIMALS);
      const from = transferToOwner.args.from;

      return {
        success: true,
        from,
        amount,
      };
    } catch (error: any) {
      console.error("[LocusPayment] Receive payment error:", error.message);
      return { success: false, error: error.message };
    }
  }

  async getOwnerBalance(): Promise<string> {
    try {
      const balance = await this.locusContract.balanceOf(this.ownerAddress);
      return ethers.formatUnits(balance, LOCUS_DECIMALS);
    } catch (error: any) {
      console.error("[LocusPayment] Get balance error:", error.message);
      return "0";
    }
  }
}

export const locusPayment = new LocusPaymentService();
