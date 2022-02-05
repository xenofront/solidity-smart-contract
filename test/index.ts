import { Contract, ContractFactory } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import type { Token } from "../typechain-types";
import { Token__factory } from "../typechain-types/factories/Token__factory";

describe("Token", function () {
  let Token: Token__factory,
    token: Token,
    owner: SignerWithAddress,
    account1: SignerWithAddress,
    account2: SignerWithAddress,
    account3: SignerWithAddress,
    rest;

  beforeEach(async () => {
    const signers = await ethers.getSigners();

    Token = (await ethers.getContractFactory(
      "Token",
      signers[0]
    )) as Token__factory;

    token = await Token.deploy("Test Token S", "TTS", 18, 1_000_000);
    [owner, account1, account2, account3, ...rest] = await ethers.getSigners();
  });

  describe("Name | Symbol", () => {
    it("Name", async () => {
      expect(await token.name()).to.equal("Test Token S");
    });

    it("Symbol", async () => {
      expect(await token.symbol()).to.equal("TTS");
    });
  });

  describe("Transfer func", () => {
    it("Fail transfer", async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await expect(
        token.transfer(
          account1.address,
          ethers.BigNumber.from(initialOwnerBalance).add(1)
        )
      ).to.be.revertedWith("Transfer amount exceeds balance");

      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
    it("Transfer tokens", async () => {
      const result = await token.transfer(account1.address, 1_000);

      const receipt = await result.wait();
      expect(receipt.logs.length).to.equal(1, "triggers one event");
      expect(receipt.events![0].event).to.equal("Transfer");
      expect(receipt.events![0].args!._from).to.equal(owner.address);
      expect(receipt.events![0].args!._to).to.equal(account1.address);
      expect(receipt.events![0].args!._amount).to.equal(1_000);
    });
    it("Transfer return 'true'", async () => {
      const success = await token.callStatic.transfer(account1.address, 1_000);

      expect(success).to.equal(true);
    });
  });

  describe("Approve func", () => {
    it("Approve event | Allowance", async () => {
      const result = await token.approve(account1.address, 2_000);

      const receipt = await result.wait();

      expect(receipt.logs.length).to.equal(1);
      expect(receipt.events![0].event).to.equal("Approval");
      expect(receipt.events![0].args!._owner).to.equal(owner.address);
      expect(receipt.events![0].args!._spender).to.equal(account1.address);
      expect(receipt.events![0].args!._amount).to.equal(2_000);

      const allowance = await token.allowance(owner.address, account1.address);
      expect(allowance).to.equal(2_000);
    });

    it("Approve return 'true'", async () => {
      const success = await token.callStatic.approve(account1.address, 3_000);

      expect(success).to.equal(true);
    });
  });

  describe("TransferFrom func", () => {
    beforeEach(async () => {
      await token.transfer(account1.address, 5_000);
      await token.connect(account1).approve(account2.address, 3_000);
    });

    it("Fail 'Amount exceeds allowance'", async () => {
      await expect(
        token
          .connect(account2)
          .transferFrom(account1.address, account3.address, 3_001)
      ).to.be.revertedWith("Amount exceeds allowance");
    });

    it("TransferFrom return 'true'", async () => {
      const success = await token
        .connect(account2)
        .callStatic.transferFrom(account1.address, account3.address, 2_000);
      expect(success).to.equal(true);
    });

    it("Allowance 0", async () => {
      await token
        .connect(account2)
        .transferFrom(account1.address, account3.address, 3_000);
      expect(
        await token
          .connect(account2)
          .allowance(account2.address, account1.address)
      ).to.equal(0);
    });
    it("Balance of equal to initial allowance", async () => {
      await token
        .connect(account2)
        .transferFrom(account1.address, account3.address, 3_000);
      expect(await token.balanceOf(account3.address)).to.equal(3_000);
    });
  });
});
