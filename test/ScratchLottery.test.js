const ScratchLottery = artifacts.require('ScratchLottery');

contract('ScratchLottery', accounts => {
    before(async () => {
        this.scratchLottery = await ScratchLottery.deployed();
    })

    it('deploys successfully', async () => {
        const address = await this.scratchLottery.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    })

    it('returns ticketCount of 0 when first deployed', async () => {
        const ticketCount = await this.scratchLottery.ticketCount();
        assert.equal(ticketCount.toNumber(), 0);
    })

    it('rejects a ticket purchase when payment not provided', async () => {
        try {
            await this.scratchLottery.purchaseTicket();
        } catch (e) {
            const correctError = e.message.includes('Tickets cost 0.005 eth');
            assert(correctError, `Unexpected error: ${e.message}`)
        }
    })

    it('creates a ticket when correct payment is provided', async () => {
        await this.scratchLottery.purchaseTicket({ value: 5000000000000000 });
        const ticketCount = await this.scratchLottery.ticketCount();
        assert.equal(ticketCount.toNumber(), 1);
        const ticket = await this.scratchLottery.getTicket();
        const id = ticket.id.toNumber();
        const blockNumber = ticket.blockNumber.toNumber();
        const redeemableAt = ticket.redeemableAt.toNumber();
        const redeemedAt = ticket.redeemedAt.toNumber();
        assert.equal(id, 1);
        assert.notEqual(blockNumber, 0);
        assert.notEqual(blockNumber, null);
        assert.notEqual(blockNumber, undefined);
        assert.notEqual(blockNumber, '');
        assert.equal(redeemableAt, blockNumber + 1);
        assert.equal(redeemedAt, 0);
    });
})