import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Hotkeys } from "../target/types/hotkeys";

describe("hotkeys", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Hotkeys as Program<Hotkeys>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
