import random

BOP_TARGET = 87  # All cars normalized toward this performance value

PHASES = [
    {"id": "depart", "label": "Départ", "hours": "16h → 20h", "duration": 4},
    {"id": "nuit", "label": "Nuit", "hours": "20h → 00h", "duration": 4},
    {"id": "nuit_profonde", "label": "Nuit Profonde", "hours": "00h → 04h", "duration": 4},
    {"id": "aube", "label": "Aube", "hours": "04h → 08h", "duration": 4},
    {"id": "sprint", "label": "Sprint Final", "hours": "08h → 16h", "duration": 8},
]

# Which pilots cover each phase and what fraction of time, per strategy
PHASE_PILOT_MAP = {
    "attaque": {  # 2h stints
        "depart":        [("P1", 0.5), ("P2", 0.5)],
        "nuit":          [("P3", 0.5), ("P1", 0.5)],
        "nuit_profonde": [("P2", 0.5), ("P3", 0.5)],
        "aube":          [("P1", 0.5), ("P2", 0.5)],
        "sprint":        [("P3", 0.25), ("P1", 0.25), ("P2", 0.25), ("P3", 0.25)],
    },
    "conservation": {  # 4h stints
        "depart":        [("P1", 1.0)],
        "nuit":          [("P2", 1.0)],
        "nuit_profonde": [("P3", 1.0)],
        "aube":          [("P1", 1.0)],
        "sprint":        [("P2", 0.5), ("P3", 0.5)],
    },
    "equilibre": {  # 3h stints
        "depart":        [("P1", 0.75), ("P2", 0.25)],
        "nuit":          [("P2", 0.5), ("P3", 0.5)],
        "nuit_profonde": [("P3", 0.25), ("P1", 0.75)],
        "aube":          [("P2", 0.75), ("P3", 0.25)],
        "sprint":        [("P3", 0.25), ("P1", 0.375), ("P2", 0.375)],
    },
}

def pilot_phase_score(pilot, phase_id):
    p = pilot
    if phase_id == "depart":
        return p["pace"] * 0.7 + p["reliability"] * 0.3
    elif phase_id == "nuit":
        return p["night_skill"] * 0.7 + p["pace"] * 0.3
    elif phase_id == "nuit_profonde":
        return p["night_skill"] * 0.5 + p["endurance"] * 0.4 + p["reliability"] * 0.1
    elif phase_id == "aube":
        return p["endurance"] * 0.6 + p["pace"] * 0.4
    elif phase_id == "sprint":
        return p["pace"] * 0.6 + p["endurance"] * 0.4
    return 85

def apply_bop(car_perf):
    """Normalize car performance toward BOP_TARGET.
    BOP rapproche les voitures, mais ne sauve pas les machines vraiment faibles :
    plus une voiture est sous la cible, moins la BOP compense (pour que les mauvais
    tirages restent punitifs)."""
    delta = car_perf - BOP_TARGET
    if delta >= 0:
        # Voitures au-dessus de la cible : forte compensation (équité)
        bop_perf = car_perf - delta * 0.7
    else:
        # Voitures sous la cible : compensation réduite -> elles restent pénalisées
        # Plus c'est faible, moins on compense (de 55% près de la cible à ~20% loin)
        gap = -delta
        comp = max(0.2, 0.55 - gap * 0.04)
        bop_perf = car_perf - delta * comp
    return bop_perf

def compute_dt_bonus(director, phase_id, has_rain):
    cond = director["bonus_condition"]
    val = director["bonus_value"]
    if cond == "all":
        return val * 0.6
    if cond == "night" and phase_id in ("nuit", "nuit_profonde"):
        return val
    if cond == "rain" and has_rain:
        return val
    if cond == "pace" and phase_id in ("depart", "sprint"):
        return val
    if cond == "strategy":
        return val * 0.5  # always active, moderate bonus
    return 0

EVENTS = [
    {"id": "safety_car", "label": "Safety Car", "description": "La SC entre en piste.", "score_delta": -3, "dnf": False, "prob": 0.25},
    {"id": "pluie", "label": "Pluie soudaine", "description": "La pluie s'abat sur la Sarthe.", "score_delta": -5, "dnf": False, "rain": True, "prob": 0.15},
    {"id": "crevaison", "label": "Crevaison !", "description": "Arrêt non planifié aux stands.", "score_delta": -10, "dnf": False, "prob": 0.12},
    {"id": "bon_stint", "label": "Stint parfait", "description": "Le pilote repousse ses limites.", "score_delta": 6, "dnf": False, "prob": 0.20},
    {"id": "depassement", "label": "Dépassement magistral", "description": "Une manœuvre de génie.", "score_delta": 4, "dnf": False, "prob": 0.18},
    {"id": "casse", "label": "Casse mécanique", "description": "La voiture s'arrête.", "score_delta": -100, "dnf": True, "prob": 0.05},
    {"id": "nuit_rapide", "label": "Nuit express", "description": "Les chrono tombent dans le noir.", "score_delta": 5, "dnf": False, "prob": 0.10, "phase_only": ["nuit", "nuit_profonde"]},
]

def roll_event(reliability, phase_id):
    """Roll for a random event. Returns event or None."""
    # Base chance of something happening
    event_chance = max(0.3, 0.7 - reliability / 200)
    if random.random() > event_chance:
        return None
    
    # Filter events to phase-relevant ones
    candidates = [e for e in EVENTS if "phase_only" not in e or phase_id in e.get("phase_only", [])]
    
    # Weight DNF by reliability
    weighted = []
    for e in candidates:
        weight = e["prob"]
        if e["dnf"]:
            # DNF chance scales inversely with reliability
            weight = weight * (100 - reliability) / 40
        weighted.append((e, weight))
    
    total = sum(w for _, w in weighted)
    r = random.random() * total
    cumulative = 0
    for event, weight in weighted:
        cumulative += weight
        if r <= cumulative:
            return event
    return None

def simulate_car(car, pilots, strategy, director):
    """Simulate a single car through all 5 phases."""
    bop_perf = apply_bop(car["performance"])
    pilot_map = {"P1": pilots[0], "P2": pilots[1], "P3": pilots[2]}
    
    avg_pilot_reliability = sum(p["reliability"] for p in pilots) / 3
    car_reliability = car["reliability"]
    dt_reliability = director["reliability_bonus"]
    
    effective_reliability = (car_reliability * 0.5 + avg_pilot_reliability * 0.35 + dt_reliability * 0.15)
    
    phase_results = []
    dnf = False
    dnf_phase = None
    leading_phases = 0
    
    for phase in PHASES:
        if dnf:
            phase_results.append({
                "phase_id": phase["id"],
                "score": 0,
                "event": None,
                "dnf": True,
            })
            continue
        
        phase_map = PHASE_PILOT_MAP[strategy][phase["id"]]
        
        # Pilot score for this phase (weighted average)
        pilot_score = sum(
            pilot_phase_score(pilot_map[key], phase["id"]) * weight
            for key, weight in phase_map
        )
        
        # Roll for event
        event = roll_event(effective_reliability, phase["id"])
        has_rain = event is not None and event.get("rain", False)
        
        # DT bonus
        dt_bonus = compute_dt_bonus(director, phase["id"], has_rain)
        
        # Strategy modifier
        strategy_mod = {"attaque": 3, "equilibre": 1, "conservation": -1}[strategy]
        
        # Compose score
        # Base = blend of pilot skill and BOP-normalized car, bonuses on top.
        base = pilot_score * 0.55 + bop_perf * 0.45
        score = (
            base +
            dt_bonus * 0.35 +
            strategy_mod +
            random.gauss(0, 4)
        )
        
        # Apply event
        event_delta = 0
        phase_dnf = False
        if event:
            event_delta = event["score_delta"]
            phase_dnf = event["dnf"]
        
        score = max(0, score + event_delta)
        
        if phase_dnf:
            dnf = True
            dnf_phase = phase["id"]
            score = 0
        
        if score >= 87:
            leading_phases += 1
        
        phase_results.append({
            "phase_id": phase["id"],
            "score": round(score, 1),
            "event": {"id": event["id"], "label": event["label"], "description": event["description"]} if event else None,
            "dnf": phase_dnf,
        })
    
    if dnf:
        return {
            "dnf": True,
            "dnf_phase": dnf_phase,
            "phase_results": phase_results,
            "final_score": 0,
            "position": None,
        }
    
    final_score = sum(r["score"] for r in phase_results) / len(phase_results)
    
    # Map score to position (field of ~50 cars)
    if final_score >= 90:
        position = random.randint(1, 3)
    elif final_score >= 86:
        position = random.randint(2, 7)
    elif final_score >= 82:
        position = random.randint(5, 14)
    elif final_score >= 77:
        position = random.randint(12, 25)
    else:
        position = random.randint(20, 45)
    
    # Wire-to-Wire : un exploit rare. Il faut finir P1, avoir dominé les 5 phases
    # (score >= 92 partout), une moyenne très haute, ET passer un verrou aléatoire.
    wire_to_wire = (
        position == 1
        and leading_phases == 5
        and final_score >= 92
        and random.random() < 0.6
    )
    
    return {
        "dnf": False,
        "dnf_phase": None,
        "phase_results": phase_results,
        "final_score": round(final_score, 1),
        "position": position,
        "wire_to_wire": wire_to_wire,
        "leading_phases": leading_phases,
    }

def simulate_race(body):
    strategy = body["strategy"]
    car1 = body["car1"]
    car2 = body["car2"]
    director = body["director"]
    pilots_car1 = body["pilots_car1"]
    pilots_car2 = body["pilots_car2"]
    
    result_car1 = simulate_car(car1, pilots_car1, strategy, director)
    result_car2 = simulate_car(car2, pilots_car2, strategy, director)
    
    # Team result = best car
    def car_rank(r):
        if r["dnf"]:
            return 999
        return r["position"]
    
    best = result_car1 if car_rank(result_car1) <= car_rank(result_car2) else result_car2
    
    # Verdict
    if result_car1["dnf"] and result_car2["dnf"]:
        verdict = "abandon"
    elif best["position"] == 1 and best.get("wire_to_wire"):
        verdict = "wire_to_wire"
    elif best["position"] == 1:
        verdict = "victoire"
    elif best["position"] <= 3:
        verdict = "podium"
    else:
        verdict = "finisher"
    
    # Phase commentary (combined)
    phase_summaries = []
    for i, phase in enumerate(PHASES):
        r1 = result_car1["phase_results"][i]
        r2 = result_car2["phase_results"][i]
        
        def score_label(score, dnf):
            if dnf: return "Abandon"
            if score >= 90: return "Dominant"
            if score >= 84: return "Solide"
            if score >= 76: return "Correct"
            return "En difficulté"
        
        phase_summaries.append({
            "phase_id": phase["id"],
            "label": phase["label"],
            "hours": phase["hours"],
            "car1_score": r1["score"],
            "car1_label": score_label(r1["score"], r1["dnf"]),
            "car1_event": r1["event"],
            "car1_dnf": r1["dnf"],
            "car2_score": r2["score"],
            "car2_label": score_label(r2["score"], r2["dnf"]),
            "car2_event": r2["event"],
            "car2_dnf": r2["dnf"],
        })
    
    # ── Score chiffré : verdict + position + difficulté du tirage gagnant ──
    win_car = car1 if best is result_car1 else car2
    win_pilots = pilots_car1 if best is result_car1 else pilots_car2

    def pilot_overall(p):
        return p["pace"]*0.3 + p["night_skill"]*0.25 + p["endurance"]*0.25 + p["reliability"]*0.2
    car_overall = (win_car["performance"] + win_car["reliability"]) / 2
    pilot_avg = sum(pilot_overall(p) for p in win_pilots) / len(win_pilots) if win_pilots else 0
    draft_rating = car_overall * 0.5 + pilot_avg * 0.5  # niveau global du tirage gagnant

    VERDICT_BASE = {"wire_to_wire": 1000, "victoire": 750, "podium": 500, "finisher": 250, "abandon": 50}
    base = VERDICT_BASE[verdict]
    pos = best["position"] if not best["dnf"] else 50
    pos_bonus = max(0, (50 - pos)) * 5                       # P1 → +245
    diff_bonus = round(max(0, (85 - draft_rating)) * 8)      # mauvais tirage qui surperforme → bonus
    # léger bonus de risque selon la stratégie
    strat_bonus = {"attaque": 60, "equilibre": 20, "conservation": 0}.get(strategy, 0)
    score = round(base + pos_bonus + diff_bonus + strat_bonus)

    return {
        "car1": result_car1,
        "car2": result_car2,
        "phase_summaries": phase_summaries,
        "verdict": verdict,
        "best_position": best["position"] if not best["dnf"] else None,
        "winning_car": 1 if best is result_car1 else 2,
        "score": score,
        "score_parts": {
            "base": base, "position": pos_bonus,
            "difficulty": diff_bonus, "strategy": strat_bonus,
            "draft_rating": round(draft_rating),
        },
    }
