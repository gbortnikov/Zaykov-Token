import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

let Token: ContractFactory;
let token: Contract;

let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;

describe("Token contract", function (){
    
    beforeEach(async function () {
        Token = await ethers.getContractFactory("Token");
        token = await Token.deploy();
        [owner, addr1, addr2] = await ethers.getSigners();
    });

    describe("Tokenomics and Info", function () {
        it("Should return basic information", async function () {
            expect(await token.name()).to.equal("Zaykov"),
            expect(await token.symbol()).to.equal("ZAYA"),
            expect(await token.decimals()).to.equal(6);
        });
        it("Should return the total supply equal to 1000000000000000", async function () {
            expect(await token.totalSupply()).to.equal(1000000000000000);
        });
        it("Deployment should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        });
    });
    describe("Balances", function () {
        it('When the requested account has no tokens it returns zero', async function () {
            expect(await token.balanceOf(addr1.address)).to.equal("0");
        });
        it('When the requested account has some tokens it returns the total amount of tokens', async function () {
            expect(await token.balanceOf(owner.address)).to.equal(1000000000000000);
        });

    });
    describe("Transactions", function () {
        describe("Should fail when", function (){

            it('transfer to zero address', async function () {
                await expect(token.transfer(ZERO_ADDRESS, 25)
                ).to.be.revertedWith("ERC20: transfer to the zero address");
            });
            
            it('transfer from zero address', async function () {
                await expect(token.transferFrom(ZERO_ADDRESS, addr1.address, 25)
                ).to.be.revertedWith("ERC20: transfer from the zero address");
            });

            it('sender doesn’t have enough tokens', async function () {
                await expect(token.transferFrom(addr1.address, addr2.address, 25)
                ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
            });

            it('transfer amount exceeds allowance', async function () {
                await expect(token.transferFrom(owner.address, addr2.address, 25)
                ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
            });
        });
        describe("Should transfer when everything is correct", function () {
            it('from owner to addr1', async function () {
                await token.transfer(addr1.address, 50);
                const addr1Balance = await token.balanceOf(addr1.address);
                expect(addr1Balance).to.equal(50);
            });

            it('from addr1 to addr2 with correct balances at the end', async function () {
                await token.transfer(addr1.address, 50);
                await token.connect(addr1).transfer(addr2.address, 25);
                const addr1Balance = await token.balanceOf(addr1.address);
                const addr2Balance = await token.balanceOf(addr2.address);
                expect(addr1Balance).to.equal(25),
                expect(addr2Balance).to.equal(25);
            });
        });

    });

    describe('Approve', function () {
        it("Approving", async function () {
            await token.approve(addr1.address, 100);
            expect(await token.allowance(owner.address, addr1.address)).to.equal(100);
        });
        it("Not approving becouse of zero address", async function () {
            await expect(token.approve(ZERO_ADDRESS, 100)
                ).to.be.revertedWith("ERC20: approve to the zero address");
        });
    });

    describe('Mint / Burn', function () {
        it("minting", async function () {
            await token.mint(addr1.address, 100);
            expect(await token.totalSupply()).to.equal(1000000000000100),
            expect(await token.balanceOf(addr1.address)).to.equal(100);
        });
        
        it("burning", async function () {
            token.transfer(addr1.address, 100);
            await token.burn(addr1.address, 100);
            expect(await token.totalSupply()).to.equal(999999999999900),
            expect(await token.balanceOf(addr1.address)).to.equal(0);
        });

        it("burn fails because the amount exceeds the balance", async function () {
            token.transfer(addr1.address, 100);
            await expect(token.burn(addr1.address, 200)
                ).to.be.revertedWith("ERC20: burn amount exceeds balance");
        });
    });
});
  