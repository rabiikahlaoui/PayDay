const { assert } = require('chai');

const Payday = artifacts.require("Payday");

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Payday', ([deployer, seller, buyer]) => {
    let payday;

    before (async () => {
        payday = await Payday.deployed();
    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await payday.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('has a name', async () => {
            const name = await payday.name();
            assert.equal(name, 'Payday marketplace');
        });
    });

    describe('products', async () => {
        let result, productCount;

        before (async () => {
            result = await payday.createProduct('MacBook Pro', web3.utils.toWei('1', 'ether'), { from: seller });
            productCount = await payday.productCount();
        });

        it('create product', async () => {
            // SUCCESS
            assert.equal(productCount, 1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct");
            assert.equal(event.name, 'MacBook Pro', "name is correct");
            assert.equal(event.price, web3.utils.toWei('1', 'ether'), "price is correct");
            assert.equal(event.owner, seller, "owner is correct");
            assert.equal(event.purchased, false, "purchased is correct");

            // FAILURE
            await payday.createProduct('', web3.utils.toWei('1', 'ether'), { from: seller }).should.be.rejected;
            await payday.createProduct('MacBook Pro', 0, { from: seller }).should.be.rejected;
        });

        it('lists products', async () => {
            const product = await payday.products(productCount);
            assert.equal(product.id.toNumber(), productCount.toNumber(), "id is correct");
            assert.equal(product.name, 'MacBook Pro', "name is correct");
            assert.equal(product.price, web3.utils.toWei('1', 'ether'), "price is correct");
            assert.equal(product.owner, seller, "owner is correct");
            assert.equal(product.purchased, false, "purchased is correct");
        });

        it('sells products', async () => {
            let oldSellerBalance;
            oldSellerBalance = await web3.eth.getBalance(seller);
            oldSellerBalance = new web3.utils.BN(oldSellerBalance);

            // SUCCESS
            result = await payday.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'ether') });
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct");
            assert.equal(event.name, 'MacBook Pro', "name is correct");
            assert.equal(event.price, web3.utils.toWei('1', 'ether'), "price is correct");
            assert.equal(event.owner, buyer, "owner is correct");
            assert.equal(event.purchased, true, "purchased is correct");

            // FAILURE
            await payday.purchaseProduct(9999, { from: buyer, value: web3.utils.toWei('1', 'ether') }).should.be.rejected;
            await payday.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'ether') }).should.be.rejected;
            await payday.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'ether') }).should.be.rejected;
            await payday.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'ether') }).should.be.rejected;

            // PAYMENT
            let newSellerBalance;
            newSellerBalance = await web3.eth.getBalance(seller); 
            newSellerBalance = new web3.utils.BN(newSellerBalance);

            let price;
            price = web3.utils.toWei('1', 'ether');
            price = new web3.utils.BN(price);

            const expectedBalance = oldSellerBalance.add(price);
            assert.equal(newSellerBalance.toString(), expectedBalance.toString());
        });
    });
});