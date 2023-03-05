import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Hotkeys } from "../target/types/hotkeys";

describe("hotkeys", () => {
  const testNftTitle = "Beta";
  const testNftSymbol = "BETA";
  const testNftUri = "https://raw.githubusercontent.com/Coding-and-Crypto/Solana-NFT-Marketplace/master/assets/example.json";

  const provider = anchor.AnchorProvider.env()

  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.Hotkeys as Program<Hotkeys>;

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Increase computational budget
  const computeBudgetIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 100_0000 });

  it("mint nft", async () => {
    const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const tokenAddress = await anchor.utils.token.associatedAddress({
      mint: mintKeypair.publicKey,
      owner: wallet.publicKey,
    });
    console.log(`New token: ${mintKeypair.publicKey}`);

    const metadataAddress = anchor.web3.PublicKey.findProgramAddressSync([
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ], TOKEN_METADATA_PROGRAM_ID)[0];

    console.log(`New metadata: ${metadataAddress}`);
    console.log("Metadata initialized");

    const masterEditionAddress = anchor.web3.PublicKey.findProgramAddressSync([
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
      Buffer.from("edition"),
    ], TOKEN_METADATA_PROGRAM_ID)[0];
    
    console.log(`New master edition: ${masterEditionAddress}`);
    console.log("Master edition metadata initialized");

    await program.methods.mintNft(
      testNftTitle,
      testNftSymbol,
      testNftUri,
    ).accounts({
      masterEdition: masterEditionAddress,
      metadata: metadataAddress,
      mint: mintKeypair.publicKey,
      tokenAccount: tokenAddress,
      mintAuthority: wallet.publicKey,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .preInstructions([computeBudgetIx])
    .signers([mintKeypair])
    .rpc();
  })
});
