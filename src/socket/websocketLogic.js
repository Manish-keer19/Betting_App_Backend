// // import mongoose from "mongoose";

// // // const Round = mongoose.model("Round", {
// // //   roundId: String,
// // //   players: [{ userId: String, choice: String }],
// // //   result: String,
// // //   createdAt: Date,
// // // });

// // let currentRound = {
// //   roundId: Date.now().toString(),
// //   players: [],
// //   createdAt: new Date(),
// // };

// // export default function handleWebSocket(io) {
// //   io.on("connection", (socket) => {
// //     console.log("New client:", socket.id);

// //     socket.emit("currentRound", {
// //       roundId: currentRound.roundId,
// //       startedAt: currentRound.createdAt,
// //     });

// //     socket.on("joinRound", ({ userId, choice }) => {
// //       currentRound.players.push({ userId, choice });
// //       socket.emit("joinedRound", { roundId: currentRound.roundId });
// //     });
// //   });

// //   setInterval(async () => {
// //     const count = { head: 0, tail: 0 };
// //     currentRound.players.forEach((p) => count[p.choice]++);

// //     const result = count.head <= count.tail ? "head" : "tail";

// //     // const roundToSave = new Round({
// //     //   ...currentRound,
// //     //   result,
// //     // });
// //     // await roundToSave.save();

// //     io.emit("roundResult", {
// //       roundId: currentRound.roundId,
// //       result,
// //       players: currentRound.players,
// //     });

// //     currentRound = {
// //       roundId: Date.now().toString(),
// //       players: [],
// //       createdAt: new Date(),
// //     };

// //     io.emit("newRound", {
// //       roundId: currentRound.roundId,
// //       startedAt: currentRound.createdAt,
// //     });
// //   }, 60000); // 1-minute interval
// // }

// import { User } from "../model/User.model.js";
// import mongoose from "mongoose";

// let currentRound = {
//   roundId: Date.now().toString(),
//   players: [],
//   createdAt: new Date(),
// };

// export default function handleWebSocket(io) {
//   io.on("connection", (socket) => {
//     console.log("New client connected:", socket.id);

//     // Send current round info to the new client
//     socket.emit("currentRound", {
//       roundId: currentRound.roundId,
//       startedAt: currentRound.createdAt,
//     });

//     // Handle bet placement
//     socket.on("placeBet", async ({ userId, choice, amount, roundId }) => {
//       try {
//         // Verify the round is still active
//         if (roundId !== currentRound.roundId) {
//           socket.emit("error", "This round has already ended");
//           return;
//         }

//         // Verify user has enough balance
//         const user = await User.findById(userId);
//         if (!user) {
//           socket.emit("error", "User not found");
//           return;
//         }

//         if (user.balance < amount) {
//           socket.emit("error", "Insufficient balance");
//           return;
//         }

//         console.log("user data is before balance minuse", user.balance);

//         // Deduct balance from user
//         user.balance -= amount;
//         if (user.balance < 0) {
//           socket.emit("error", "Insufficient balance after deduction");
//           return;
//         }

//         console.log("user data is after balance minuse", user.balance);
//         await user.save();

//         // Add to current round
//         currentRound.players.push({ userId, choice, amount });

//         socket.emit("betPlaced", { amount, choice });
//         socket.emit("balanceUpdate", { balance: user.balance });
//       } catch (error) {
//         console.error("Error placing bet:", error);
//         socket.emit("error", "Failed to place bet");
//       }
//     });
//   });

//   // Round processing interval
//   setInterval(async () => {
//     if (currentRound.players.length === 0) {
//       // No players in this round, just start a new one
//       currentRound = {
//         roundId: Date.now().toString(),
//         players: [],
//         createdAt: new Date(),
//       };
//       io.emit("newRound", {
//         roundId: currentRound.roundId,
//         startedAt: currentRound.createdAt,
//       });
//       return;
//     }

//     // Determine result (50/50 chance)
//     const result = Math.random() < 0.5 ? "head" : "tail";

//     // Process winners and update balances
//     const winners = currentRound.players.filter((p) => p.choice === result);
//     const updatePromises = winners.map(async (player) => {
//       try {
//         const user = await User.findById(player.userId);
//         if (user) {
//           // Pay 1.95x the bet amount (5% house edge)
//           const payout = player.amount * 1.95;
//           user.balance += payout;
//           await user.save();

//           // Update the player record with payout
//           player.payout = payout;

//           // Notify the user
//           io.to(player.userId.toString()).emit("balanceUpdate", {
//             balance: user.balance,
//             win: true,
//             amount: payout,
//           });
//         }
//       } catch (error) {
//         console.error(
//           `Error processing payout for user ${player.userId}:`,
//           error
//         );
//       }
//     });

//     await Promise.all(updatePromises);

//     // Save round result (you would save to database here)
//     currentRound.result = result;

//     // Broadcast result
//     io.emit("roundResult", {
//       roundId: currentRound.roundId,
//       result,
//       players: currentRound.players,
//     });

//     // Start new round
//     currentRound = {
//       roundId: Date.now().toString(),
//       players: [],
//       createdAt: new Date(),
//     };

//     io.emit("newRound", {
//       roundId: currentRound.roundId,
//       startedAt: currentRound.createdAt,
//     });
//   }, 60000); // 1-minute rounds
// }

import { User } from "../model/User.model.js";
import mongoose from "mongoose";

let currentRound = {
  roundId: Date.now().toString(),
  players: [],
  createdAt: new Date(),
  totals: { head: 0, tail: 0 }, // track total bet amounts
};

export default function handleWebSocket(io) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Track connected socket
    socket.on("registerUser", (userId) => {
      console.log("User registered:", userId);
      socket.join(userId.toString()); // join room even if user didn't bet
    });

    socket.emit("currentRound", {
      roundId: currentRound.roundId,
      startedAt: currentRound.createdAt,
    });

    socket.on("placeBet", async ({ userId, choice, amount, roundId }) => {
      try {
        if (roundId !== currentRound.roundId) {
          socket.emit("error", "This round has already ended");
          return;
        }
        socket.join(userId.toString());

        const user = await User.findById(userId);
        if (!user) {
          socket.emit("error", "User not found");
          return;
        }

        if (user.balance < amount) {
          socket.emit("error", "Insufficient balance");
          return;
        }

        user.balance -= amount;
        await user.save();

        // Update round info
        currentRound.players.push({ userId, choice, amount });

        // Add to total amount per choice
        currentRound.totals[choice] += amount;

        socket.emit("betPlaced", { amount, choice });
        socket.emit("balanceUpdate", { balance: user.balance });
      } catch (error) {
        console.error("Error placing bet:", error);
        socket.emit("error", "Failed to place bet");
      }
    });
  });

  setInterval(async () => {
    if (currentRound.players.length === 0) {
      // No bets - start a new round
      currentRound = {
        roundId: Date.now().toString(),
        players: [],
        createdAt: new Date(),
        totals: { head: 0, tail: 0 },
      };
      io.emit("newRound", {
        roundId: currentRound.roundId,
        startedAt: currentRound.createdAt,
      });
      return;
    }

    // Determine winning side: one with less total amount
    const { head, tail } = currentRound.totals;
    let result = null;

    if (head === tail) {
      result = Math.random() < 0.5 ? "head" : "tail"; // tie → random
    } else {
      result = head < tail ? "head" : "tail";
      // result = "head";
    }

    const winners = currentRound.players.filter((p) => p.choice === result);
    const updatePromises = winners.map(async (player) => {
      try {
        const user = await User.findById(player.userId);
        if (user) {
          const payout = player.amount * 1.95;
          user.balance += payout;
          await user.save();

          player.payout = payout;
        }
      } catch (error) {
        console.error(
          `Error processing payout for user ${player.userId}:`,
          error
        );
      }
    });

    await Promise.all(updatePromises);

    // Emit round result to all clients
    io.emit("roundResult", {
      roundId: currentRound.roundId,
      result,
      players: currentRound.players,
      totals: currentRound.totals,
    });

    // Send win notification AFTER all updates
    winners.forEach((player) => {
      if (player.payout) {
        io.to(player.userId.toString()).emit("wonMessage", {
          message: `🎉 You won ₹${player.payout.toFixed(2)}!`,
          amount: player.payout,
        });
      }
    });

    // Start new round
    currentRound = {
      roundId: Date.now().toString(),
      players: [],
      createdAt: new Date(),
      totals: { head: 0, tail: 0 },
    };

    io.emit("newRound", {
      roundId: currentRound.roundId,
      startedAt: currentRound.createdAt,
    });
  }, 60000); // every minute
}
