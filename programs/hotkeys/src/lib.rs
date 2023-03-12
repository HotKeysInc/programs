use anchor_lang::prelude::*;

declare_id!("2mRwz7BwuAtDMDa3YDs9QunYpjoNkFuh6ciQLNVDJcmN");

pub mod mint;
pub mod sell;

use mint::*;
use sell::*;

#[program]
pub mod hotkeys {
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintToken>,
        metadata_title: String,
        metadata_symbol: String,
        metadata_uri: String,
    ) -> Result<()> {
        mint::mint_nft(ctx, metadata_title, metadata_symbol, metadata_uri)
    }

    pub fn sell_nft(ctx: Context<SellToken>, sale_lamports: u64) -> Result<()> {
        sell::sell_nft(ctx, sale_lamports)
    }
}
