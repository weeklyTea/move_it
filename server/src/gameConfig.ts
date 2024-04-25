const mapWidth = 40

export const gameConfig = {
  defPlayerLength: 10,
  defPlayerThickness: 2,
  mapWidth: mapWidth,
  mapLen: mapWidth * 16 / 9,
  speed: 9,
  countdownTime: 3100,
};

export const maxX = gameConfig.mapLen / 2
export const maxY = gameConfig.mapWidth / 2
