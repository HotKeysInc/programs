use anchor_lang::prelude::*;

declare_id!("3pe5Hxtm7vtyoNXgfDei3DFheisFiZg8Xs8XkVbk4Hsz");

#[program]
pub mod hotkeys {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Init: {}", ctx.program_id);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
