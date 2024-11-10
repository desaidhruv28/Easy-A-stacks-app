
const {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  uintCV,
  principalCV
} = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');

async function getTopThreeUsers() {
  try {
    // Implement your database query here
    // Example using MongoDB:
    /* const topUsers = await UserModel.find()
      .sort({ score: -1 })
      .limit(3)
      .select('address score')
      .lean();
    return topUsers; */

    // Placeholder return
    return [
      { address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', score: 1000 },
      { address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', score: 900 },
      { address: 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC', score: 800 }
    ];
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw error;
  }
}

async function distributeLeaderboardRewards() {
  try {
    const topUsers = await getTopThreeUsers();

    // Reward amounts in microSTX (1 STX = 1,000,000 microSTX)
    const rewards = {
      first: 100000000n,  // 100 STX
      second: 50000000n,  // 50 STX
      third: 25000000n    // 25 STX
    };

    // Network configuration
    const network = "devnet"; // Use StacksMainnet() for production

    // Contract details
    const contractAddress = 'SPBMRFRPPGCDE3F384WCJPK8PQJGZ8K9QKK7F59X';
    const contractName = 'rewards-distribution';
    const functionName = 'distribute-reward';
    const senderKey = process.env.SENDER_PRIVATE_KEY;

    if (!senderKey) {
      throw new Error('SENDER_PRIVATE_KEY environment variable not set');
    }

    // // Verify contract exists and is accessible
    // try {
    //   const ownerResponse = await callReadOnlyFunction({
    //     contractAddress,
    //     contractName,
    //     functionName: 'get-contract-owner',
    //     functionArgs: [],
    //     network,
    //     senderAddress: contractAddress,
    //   });
    //   console.log('Contract owner verified:', ownerResponse);
    // } catch (error) {
    //   console.error('Error verifying contract:', error);
    //   throw new Error('Contract not accessible. Make sure it is properly deployed.');
    // }

    // Distribute rewards to each winner
    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const rewardAmount = i === 0 ? rewards.first : i === 1 ? rewards.second : rewards.third;

      // const postConditions = [
      //   makeStandardSTXPostCondition(
      //       contractAddress,
      //       FungibleConditionCode.GreaterEqual,
      //       rewardAmount
      //   )
      // ];

      const txOptions = {
        contractAddress,
        contractName,
        functionName,
        functionArgs: [
          principalCV(user.address),
          uintCV(rewardAmount)
        ],
        senderKey,
        validateWithAbi: true,
        network: "devnet",
        // postConditions,
        anchorMode: AnchorMode.Any,
      };

      // Make and broadcast the contract call
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, "devnet");

      console.log(`Reward distributed to ${user.address}, txId: ${broadcastResponse.txid}`);

      // Wait for a few seconds between transactions
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('Rewards distribution completed successfully');
  } catch (error) {
    console.error('Error distributing rewards:', error);
    throw error;
  }
}

// If you want to add scheduled execution using node-cron
function initCronJobs() {
  const cron = require('node-cron');

  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled leaderboard reward distribution');
    await distributeLeaderboardRewards();
  });
}

module.exports = {
  distributeLeaderboardRewards,
  initCronJobs
};