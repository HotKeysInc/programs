import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Hotkeys } from "../target/types/hotkeys";

import * as path from "path";

import { createKeypairFromFile } from "./utils";

describe("hotkeys", () => {
  const testNftTitle = "HotKeys";
  const testNftSymbol = "";
  const testNftUri =
    "https://raw.githubusercontent.com/HotKeysInc/programs/main/assets/test_metadata.json";

  const provider = anchor.AnchorProvider.env();

  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.Hotkeys as Program<Hotkeys>;

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Increase computational budget
  const computeBudgetIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
    units: 100_0000,
  });

  it("mint nft", async () => {
    const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const tokenAddress = await anchor.utils.token.associatedAddress({
      mint: mintKeypair.publicKey,
      owner: wallet.publicKey,
    });
    console.log(`New token: ${mintKeypair.publicKey}`);

    const metadataAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    console.log(`New metadata: ${metadataAddress}`);
    console.log("Metadata initialized");

    const masterEditionAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    console.log(`New master edition: ${masterEditionAddress}`);
    console.log("Master edition metadata initialized");

    await program.methods
      .mintNft(testNftTitle, testNftSymbol, testNftUri)
      .accounts({
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
  });

  it("should sell nft", async () => {
    const saleAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;

    // Set this accordingly
    const mint = new anchor.web3.PublicKey(
      "5TQqaYWtTvW5Tn9smw91mKrayXNeUicNBoggxjh7qYx6"
    );
    const buyer = await createKeypairFromFile(
      path.join(__dirname, "keypairs", "alternate.json")
    );
    console.log(`Buyer public key: ${buyer.publicKey}`);

    // Derive associated token accounts for owner and buyer
    const ownerTokenAddress = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: wallet.publicKey,
    });
    const buyerTokenAddress = await anchor.utils.token.associatedAddress({
      mint: mint,
      owner: buyer.publicKey,
    });

    console.log(`Request to sell NFT: ${mint} for ${saleAmount} lamports.`);
    console.log(`Owner's Token Address: ${ownerTokenAddress}`);
    console.log(`Buyer's Token Address: ${buyerTokenAddress}`);

    // Transact using the on-chain sell instruction
    await program.methods
      .sellNft(new anchor.BN(saleAmount))
      .accounts({
        mint: mint,
        ownerTokenAccount: ownerTokenAddress,
        ownerAuthority: wallet.publicKey,
        buyerTokenAccount: buyerTokenAddress,
        buyerAuthority: buyer.publicKey,
      })
      .signers([buyer])
      .rpc();
  });
});
