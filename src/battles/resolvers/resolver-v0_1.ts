export type TroopCategory = 'infantry' | 'archers' | 'cavalry';

export type Unit = { quantity: number; attack: number; defense: number };
export type Army = Record<TroopCategory, Unit>;

export type BattleResultV0_1 = {
    winner: 'attacker' | 'defender';
    attackerLosses: Record<TroopCategory, number>;
    defenderLosses: Record<TroopCategory, number>;
    attackerRemaining: Record<TroopCategory, number>;
    defenderRemaining: Record<TroopCategory, number>;
};

const ADVANTAGE: Record<TroopCategory, TroopCategory> = {
    infantry: 'archers',
    archers: 'cavalry',
    cavalry: 'infantry',
};

const LOSS_FACTOR = 0.6;

function rpsMultiplier(attackerType: TroopCategory, defenderType: TroopCategory) {
    if (attackerType === defenderType) return 1.0;
    return ADVANTAGE[attackerType] === defenderType ? 1.25 : 0.75;
}

function baseScore(u: Unit) {
    // 1:1 weging zoals afgesproken
    return u.quantity * (u.attack + u.defense);
}

function engagementScore(attType: TroopCategory, att: Unit, defType: TroopCategory, def: Unit) {
    return baseScore(att) * rpsMultiplier(attType, defType);
}

function clampLoss(loss: number, qty: number) {
    if (loss < 0) return 0;
    if (loss > qty) return qty;
    return loss;
}

export function resolveBattleV0_1(attacker: Army, defender: Army): BattleResultV0_1 {
    const engagements: Array<{ a: TroopCategory; d: TroopCategory }> = [
        { a: 'infantry', d: 'archers' },
        { a: 'archers', d: 'cavalry' },
        { a: 'cavalry', d: 'infantry' },
    ];

    const attackerLosses: Record<TroopCategory, number> = { infantry: 0, archers: 0, cavalry: 0 };
    const defenderLosses: Record<TroopCategory, number> = { infantry: 0, archers: 0, cavalry: 0 };

    let attackerTotalScore = 0;
    let defenderTotalScore = 0;

    for (const e of engagements) {
        const aUnit = attacker[e.a];
        const dUnit = defender[e.d];

        const aScore = engagementScore(e.a, aUnit, e.d, dUnit);
        const dScore = engagementScore(e.d, dUnit, e.a, aUnit);

        attackerTotalScore += aScore;
        defenderTotalScore += dScore;

        const total = aScore + dScore;
        if (total <= 0) continue;

        const aLossRaw = Math.floor(aUnit.quantity * LOSS_FACTOR * (dScore / total));
        const dLossRaw = Math.floor(dUnit.quantity * LOSS_FACTOR * (aScore / total));

        attackerLosses[e.a] = clampLoss(aLossRaw, aUnit.quantity);
        defenderLosses[e.d] = clampLoss(dLossRaw, dUnit.quantity);
    }

    const attackerRemaining: Record<TroopCategory, number> = {
        infantry: attacker.infantry.quantity - attackerLosses.infantry,
        archers: attacker.archers.quantity - attackerLosses.archers,
        cavalry: attacker.cavalry.quantity - attackerLosses.cavalry,
    };

    const defenderRemaining: Record<TroopCategory, number> = {
        infantry: defender.infantry.quantity - defenderLosses.infantry,
        archers: defender.archers.quantity - defenderLosses.archers,
        cavalry: defender.cavalry.quantity - defenderLosses.cavalry,
    };

    const winner: 'attacker' | 'defender' =
        attackerTotalScore > defenderTotalScore ? 'attacker' : 'defender'; // tie -> defender

    return {
        winner,
        attackerLosses,
        defenderLosses,
        attackerRemaining,
        defenderRemaining,
    };
}
