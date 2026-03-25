// ELO Rating System
// Base rating: 1000
// K-factor: 32 (determines rating volatility)

const getExpectedScore = (ratingA, ratingB) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

const calculateNewRating = (currentRating, expectedScore, playerWon) => {
  const K = 32;
  const actualScore = playerWon ? 1 : 0;
  return Math.round(currentRating + K * (actualScore - expectedScore));
};

const updateRatings = (player1Rating, player2Rating, player1Won) => {
  const expectedScore1 = getExpectedScore(player1Rating, player2Rating);
  const expectedScore2 = getExpectedScore(player2Rating, player1Rating);

  const newRating1 = calculateNewRating(
    player1Rating,
    expectedScore1,
    player1Won,
  );
  const newRating2 = calculateNewRating(
    player2Rating,
    expectedScore2,
    !player1Won,
  );

  return { newRating1, newRating2 };
};

module.exports = { updateRatings, calculateNewRating, getExpectedScore };
