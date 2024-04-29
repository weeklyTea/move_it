const mapWidth = 60

export const gameConfig = {
  defPlayerLength: 14,
  defPlayerThickness: 2,
  mapWidth: mapWidth,
  mapLen: mapWidth * 16 / 9,
  // stepSize: 8,
  stepSize: 14,
  switchingSeekerDelay: 3000,
  countdownTime: 3100,
  damagePerSec: 100 / 15,

  // Physics:
  playerMass: 1,
  stiffness: 100,
  dampingFactor: 18,
  perpendicularFine: 0.2,
};

export const maxX = gameConfig.mapLen / 2
export const maxY = gameConfig.mapWidth / 2
