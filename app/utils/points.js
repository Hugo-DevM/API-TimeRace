const POINTS_TABLE = {
    1: 250,
    2: 200,
    3: 160,
    4: 150,
    5: 140,
    6: 130,
    7: 120,
    8: 110,
    9: 100,
    10: 95,
    11: 90,
    12: 85,
    13: 80,
    14: 78,
    15: 76,
    16: 74,
    17: 72,
    18: 70,
    19: 60
};

export function getPointsForPosition(position) {
    if (POINTS_TABLE[position]) return POINTS_TABLE[position];
    if (position >= 20 && position <= 50) return 50;
    return 0;
}

export function assignPoints(results) {
    return results.map(result => ({
        runner_id: result.runner_id,
        points: getPointsForPosition(result.position)
    }));
}
