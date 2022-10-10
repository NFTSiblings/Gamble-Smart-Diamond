const { expect } = require('chai')
const { deployDiamond } = require('../scripts/diamondFullDeployment.js')
const helpers = require('@nomicfoundation/hardhat-network-helpers')
const { ethers } = require('hardhat')


describe("CenterFacet", () => {
    

    beforeEach(async () => {

        [owner, address1, address2, address3, address4, address5, address6] = await ethers.getSigners()

        diamond = await deployDiamond()
        TestDiamond = await ethers.getContractAt('GamblingERC721ATemplate', diamond)
        AdminPauseFacet = await ethers.getContractAt('AdminPauseFacet', diamond)
        AdminPrivilegesFacet = await ethers.getContractAt('AdminPrivilegesFacet', diamond)
        Allowlist = await ethers.getContractAt('AllowlistFacet', diamond)
        CenterFacet = await ethers.getContractAt('CenterFacet', diamond)
        DiamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamond)
        DiamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamond)
        ERC165Facet = await ethers.getContractAt('ERC165Facet', diamond)
        PaymentSplitterFacet = await ethers.getContractAt('PaymentSplitterFacet', diamond)
        RoyaltiesConfigFacet = await ethers.getContractAt('RoyaltiesConfigFacet', diamond)
        SaleHandlerFacet = await ethers.getContractAt('SaleHandlerFacet', diamond)
        
        priceAl = ethers.utils.parseEther('0.001')
        price = ethers.utils.parseEther('0.001')

        merkleProof1 = [
            '0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0',
            '0x8a3552d60a98e0ade765adddad0a2e420ca9b1eef5f326ba7ab860bb4ea72c94'
        ]

        merkleProof2 = [
            '0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9',
            '0x8a3552d60a98e0ade765adddad0a2e420ca9b1eef5f326ba7ab860bb4ea72c94'
        ]

        merkleProof3 = [
            '0x070e8db97b197cc0e4a1790c5e6c3667bab32d733db7f815fbe84f5824c7168d'
          ]

        merkleProof4 = []
        
    })

    describe('Internal Minting logic', () => {

        it('Check the simple reserve function', async () => {

            await CenterFacet.reserve(1)
            expect(await CenterFacet.totalSupply()).to.equal(1)
            expect(await CenterFacet.balanceOf(owner.address)).to.equal(1)

        })

    })

    describe('Check maxSupply function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.maxSupply()).to.equal(10000)

        })

    })

    describe('Check walletCap function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.walletCap()).to.equal(20)

        })
        
    })

    describe('Check walletCapAL function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.walletCapAL()).to.equal(5)

        })
        
    })

    describe('Check priceAL function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.priceAL()).to.equal(ethers.BigNumber.from(ethers.utils.parseEther("0.001")))

        })
        
    })

    describe('Check price function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.price()).to.equal(ethers.BigNumber.from(ethers.utils.parseEther("0.001")))

        })
        
    })

    describe('Check burnStatus function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.burnStatus()).to.equal(false)

        })

    })

    describe('Check level function', () => {

        it('Check the initial states', async () => {

            await CenterFacet.reserve(1);
            expect(await CenterFacet.level(0)).to.equal(0)

        })

        it("Reverts if the tokenId doesn't exist", async () => {

            await expect(CenterFacet.level(0))
            .to.be.revertedWith("Given tokenId does not exist")

        })
        
    })

    describe('Check setPrices function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)
            price = [ethers.BigNumber.from(ethers.utils.parseEther('0.01')), ethers.BigNumber.from(ethers.utils.parseEther('0.015'))]

        })

        it('Admins should setPrices', async () => {

            await CenterFacet.connect(owner).setPrices(price[0], price[1])
            expect(await CenterFacet.priceAL()).to.equal(price[1])
            expect(await CenterFacet.price()).to.equal(price[0])

        })

        it('Non-admin calling setPrices should revert', async () => {

            await expect(CenterFacet.connect(address1).setPrices(price[0], price[1]))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })
        
    })

    describe('Check setWalletCaps function', () => {
        
        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)
            walletCap = [4, 16]

        })

        it('Admins should setWalletCaps', async () => {

            await CenterFacet.connect(owner).setWalletCaps(walletCap[0], walletCap[1])
            expect(await CenterFacet.walletCapAL()).to.equal(walletCap[1])
            expect(await CenterFacet.walletCap()).to.equal(walletCap[0])

        })

        it('Non-admin calling setWalletCaps should revert', async () => {

            await expect(CenterFacet.connect(address1).setWalletCaps(walletCap[0], walletCap[1]))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })

    })

    describe('Check toggleBurnStatus function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)
            currentBurnStatus = await CenterFacet.burnStatus()

        })

        it('Admins should toggleBurnStatus', async () => {

            await CenterFacet.connect(owner).toggleBurnStatus()
            expect(await CenterFacet.burnStatus()).to.equal(!currentBurnStatus)

        })

        it('Non-admin calling toggleburnStatus should revert', async () => {

            await expect(CenterFacet.connect(address1).toggleBurnStatus())
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })
        
    })

    describe('Check setBaseURI function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)
            await CenterFacet.reserve(1)
            baseURI = 'https://gateway.ipfs.io/#1243/'

        })

        it('Admins should setBaseURI', async () => {

            await CenterFacet.connect(owner).setBaseURI(baseURI)
            expect(await CenterFacet.tokenURI(0)).to.equal(baseURI + "0")

        })

        it('Non-admin calling setBaseURI should revert', async () => {

            await expect(CenterFacet.connect(address1).setBaseURI(baseURI))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })
        
    })

    describe('Check reserve function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)

            numberOfTokensToMint = 5
            currentTotalSupply = await CenterFacet.totalSupply()
            currentBalanceOfOwner = await CenterFacet.balanceOf(owner.address)

        })

        it('reserve function working as intended', async () => {

            await CenterFacet.connect(owner).reserve(numberOfTokensToMint)
            expect(await CenterFacet.totalSupply()).to.equal(currentTotalSupply + numberOfTokensToMint)
            expect(await CenterFacet.balanceOf(owner.address)).to.equal(currentBalanceOfOwner + numberOfTokensToMint)

        })
        
        it('Non-admin calling reserve should revert', async () => {

            await expect(CenterFacet.connect(address1).reserve(numberOfTokensToMint))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')
            
        })

    })

    describe('Check mint function', () => {

        beforeEach(async () => {

            expect(await CenterFacet.totalSupply()).to.equal(0)
            expect(await AdminPauseFacet.paused()).to.equal(false)
            amountToMint = 2

        })

        it('mint function reverted as either sale did not start', async () => {

            await expect(CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value:price*amountToMint}))
            .to.be.revertedWith('CenterFacet: token sale is not available now')

        })

        it('mint function working as intended for privSale', async () => {

            await helpers.time.increaseTo(await SaleHandlerFacet.saleTimestamp())
            await CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: priceAl*amountToMint})
            expect(await CenterFacet.balanceOf(address1.address)).to.equal(amountToMint)
            const tokenIds = await CenterFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.balance; i++) {
                expect(await CenterFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
                expect(await CenterFacet.level(tokenIds[i])).to.equal(0)
            }
            await expect(CenterFacet.connect(address3).mint(amountToMint, merkleProof4, {value: priceAl*amountToMint}))
            .to.be.revertedWith('AllowlistFacet: invalid merkle proof')

        })

        it('mint function working as intended for publicSale', async () => {

            await helpers.time.increaseTo((await SaleHandlerFacet.saleTimestamp()).add((await SaleHandlerFacet.privSaleLength())))
            await CenterFacet.connect(address1).mint(amountToMint, [], {value: price*amountToMint})
            expect(await CenterFacet.balanceOf(address1.address)).to.equal(amountToMint)
            const tokenIdsAddress1 = await CenterFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIdsAddress1.length; i++) {
                expect(await CenterFacet.ownerOf(tokenIdsAddress1[i])).to.equal(address1.address)
                expect(await CenterFacet.level(tokenIdsAddress1[i])).to.equal(0)
            }

            await CenterFacet.connect(address3).mint(amountToMint, [], {value: price*amountToMint})
            expect(await CenterFacet.balanceOf(address1.address)).to.equal(amountToMint)
            const tokenIdsAddress3 = await CenterFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIdsAddress3.length; i++) {
                expect(await CenterFacet.ownerOf(tokenIdsAddress3[i])).to.equal(address1.address)
                expect(await CenterFacet.level(tokenIdsAddress3[i])).to.equal(0)
            }

        })

        it('mint function reverted as improper amount sent', async () => {

            await expect(CenterFacet.connect(address1).mint(amountToMint, [], {value: price}))
            .to.be.revertedWith('CenterFacet: incorrect amount of ether sent')
            await expect(CenterFacet.connect(address1).mint(amountToMint, []))
            .to.be.revertedWith('CenterFacet: incorrect amount of ether sent')

        })

        it('mint function reverted as minting more than walletCap', async () => {

            for(let i = 0; i < 10; i++) {
                await CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: price*amountToMint})
            }
            await expect(CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: price*amountToMint}))
            .to.be.revertedWith('CenterFacet: maximum tokens per wallet during public sale is 20')

        })

        it('mint function reverted as supply has ended', async () => {

            const newWalletCap = [50000, 10]
            await CenterFacet.setWalletCaps(newWalletCap[0], newWalletCap[1])
            const mintInSingleLoop = 10
            const fullAmount = ethers.BigNumber.from(price).mul(mintInSingleLoop)
            for(let i = 0; i < 10000; i = i + mintInSingleLoop) {
                await CenterFacet.mint(mintInSingleLoop, [], {value: fullAmount})
            }
            await expect(CenterFacet.mint(1, [], {value: price}))
            .to.be.revertedWith('CenterFacet: too few tokens remaining')

        })

    })

    describe('Check burn function', () => {

        beforeEach(async () => {

            numberOfTokensToMint = 1
            currentTotalSupply = await CenterFacet.totalSupply()
            currentBalanceOfAddress1 = await CenterFacet.balanceOf(address1.address)

            await CenterFacet.connect(address1).mint(1, [], {value: price})
            expect(await CenterFacet.burnStatus()).to.equal(false)
            await CenterFacet.toggleBurnStatus()
            expect(await CenterFacet.burnStatus()).to.equal(true)
            expect(await AdminPauseFacet.paused()).to.equal(false)
            tokenIdsOfAddress1 = await CenterFacet.tokensOfOwner(address1.address)

        })
        
        it('burn function works as intended', async () => {

            await CenterFacet.connect(address1).burn(tokenIdsOfAddress1[0])
            expect(await CenterFacet.totalSupply()).to.equal(currentTotalSupply + numberOfTokensToMint - 1)
            expect(await CenterFacet.balanceOf(address1.address)).to.equal(currentBalanceOfAddress1 + numberOfTokensToMint - 1)
            
        })

        it('burn function reverts when contract is paused', async () => {

            await AdminPauseFacet.togglePause()
            expect(await AdminPauseFacet.paused()).to.equal(true)
            await expect(CenterFacet.connect(address1).burn(tokenIdsOfAddress1[0]))
            .to.be.revertedWith('GlobalState: contract is paused')
            
        })

        it('burn function reverts when burnStatus is false', async () => {

            await CenterFacet.toggleBurnStatus()
            expect(await CenterFacet.burnStatus()).to.equal(false)
            await expect(CenterFacet.connect(address1).burn(tokenIdsOfAddress1[0]))
            .to.be.revertedWith('CenterFacet: token burning is not available now')
            
        })

        it('burn function reverts when the sender is the owner of the tokenId', async () => {

            await expect(CenterFacet.connect(owner).burn(tokenIdsOfAddress1[0]))
            .to.be.reverted
            
        })

    })

    describe('Check tokenURI function', () => {

        beforeEach(async () => {

            await CenterFacet.reserve(1)
            baseURI = 'https://gateway.ipfs.io/'
            await CenterFacet.setBaseURI(baseURI)

        })

        it('Check tokenURI function is working correctly', async () => {

            expect(await CenterFacet.tokenURI(0)).to.equal(baseURI + '0')

        })
        
    })

    describe('Check gamble function', () => {

        beforeEach(async () => {

            numberOfTokenMinted = 10
            expect(await AdminPrivilegesFacet.isAdmin(owner.address))
            await CenterFacet.connect(owner).reserve(numberOfTokenMinted)
            snapshot = await helpers.takeSnapshot();

        })

        it('Gamble function working correctly', async () => {

            for(let x = 0; x < 10; x++){
                console.log(`${x} Iteration:`)
                console.log('')
                await snapshot.restore();
                for(let i = 0; i < numberOfTokenMinted; i++){
                    const currentLevel = await CenterFacet.level(i)
                    let numberOfLoop = 0
                    for(let j = 1; j < 2;){
                        numberOfLoop++
                        let tx = await CenterFacet.gamble(i)
                        let receipt = await tx.wait()
                        j = receipt.events.length
                        if(j == 1){
                            expect(await CenterFacet.level(i)).to.equal(currentLevel + numberOfLoop)
                        }
                        else if(j == 2) {
                            expect(await CenterFacet.exists(i)).to.equal(false)
                        }
                    }
                    console.log(numberOfLoop)
                }
                console.log('')
            }

        })

    })

})