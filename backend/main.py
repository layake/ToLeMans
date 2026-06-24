from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import random
from datetime import date
from simulation import simulate_race
from costs import car_cost, pilot_cost, director_cost, team_entry_cost, pilot_rating, car_rating

app = FastAPI(title="TLM – To Le Mans API")

# Budget de départ (M€)
START_BUDGET = 280
# Position de départ : entre P1 et MAX_START
MAX_START_POSITION = 20

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("data/cars.json") as f:
    CARS = json.load(f)

with open("data/directors.json") as f:
    DIRECTORS = json.load(f)

with open("data/team_entries.json") as f:
    TEAM_ENTRIES = json.load(f)


def today_seed():
    return date.today().isoformat()


@app.get("/health")
def health():
    return {"status": "ok", "cars": len(CARS), "teams": len(TEAM_ENTRIES), "directors": len(DIRECTORS)}


@app.get("/directors")
def get_directors():
    return [{**d, "cost": director_cost(d)} for d in DIRECTORS]


@app.get("/config")
def get_config():
    """Configuration globale du jeu : budget, position max, etc."""
    return {
        "start_budget": START_BUDGET,
        "max_start_position": MAX_START_POSITION,
        "currency": "M€",
    }


@app.post("/start-positions")
def start_positions(body: dict):
    """Tire les 2 positions de départ V1/V2 entre P1 et MAX_START_POSITION."""
    # Optionnellement : la qualité du tirage influence la médiane de la position
    # Pour l'instant : simple tirage aléatoire, distinct
    pos1 = random.randint(1, MAX_START_POSITION)
    pos2 = random.randint(1, MAX_START_POSITION)
    while pos2 == pos1:
        pos2 = random.randint(1, MAX_START_POSITION)
    return {"car1": pos1, "car2": pos2}


@app.post("/draw/car")
def draw_car(body: dict):
    """Tire 2 voitures aléatoires avec coûts. Si budget insuffisant, malus signalé."""
    exclude = body.get("exclude", [])
    budget_left = body.get("budget_left", START_BUDGET)
    available = [c for c in CARS if c["id"] not in exclude]
    if not available:
        return {"error": "No cars available"}
    if len(available) < 2:
        selected = available
    else:
        selected = random.sample(available, 2)
    options = []
    for c in selected:
        cost = car_cost(c)
        options.append({**c, "cost": cost, "over_budget": cost > budget_left})
    return {"options": options}


# Map id -> nom de pilote (un même vrai pilote a plusieurs ids selon l'année)
PILOT_NAME_BY_ID = {p["id"]: p["name"] for t in TEAM_ENTRIES for p in t["pilots"]}


def chosen_names(chosen_pilot_ids):
    """Résout les ids choisis en NOMS de pilotes, pour exclure un même vrai pilote
    même s'il existe en plusieurs exemplaires (ids différents) dans la base."""
    return {PILOT_NAME_BY_ID.get(pid, pid) for pid in chosen_pilot_ids}


@app.post("/draw/teams")
def draw_teams(body: dict):
    """Tire 2 écuries aléatoires avec coûts pilote. Exclut celles avec un pilote déjà choisi."""
    chosen_pilot_ids = body.get("chosen_pilot_ids", [])
    budget_left = body.get("budget_left", START_BUDGET)
    taken = chosen_names(chosen_pilot_ids)
    available = [
        t for t in TEAM_ENTRIES
        if not any(p["name"] in taken for p in t["pilots"])
    ]
    if len(available) < 2:
        return {"error": "Not enough teams available", "available": len(available)}

    selected = random.sample(available, 2)

    def with_costs(t):
        pilots_with_cost = [{**p, "cost": pilot_cost(p)} for p in t["pilots"]]
        min_cost = min(p["cost"] for p in pilots_with_cost)
        return {**t, "pilots": pilots_with_cost, "min_pilot_cost": min_cost, "over_budget": min_cost > budget_left}

    return {"team1": with_costs(selected[0]), "team2": with_costs(selected[1])}


@app.get("/daily")
def daily():
    """Tirage quotidien déterministe : identique pour tous le même jour.
    Renvoie les 2 voitures imposées + l'ordre fixe des paires d'écuries pour les 6 choix de pilotes."""
    seed = today_seed()
    rng = random.Random(seed)

    # 2 voitures imposées (distinctes)
    cars = rng.sample(CARS, 2)

    # Pré-génère 6 paires d'écuries en respectant la contrainte d'unicité des pilotes
    # On simule tous les chemins possibles serait trop lourd ; on fixe une SÉQUENCE de paires
    # en retirant progressivement les écuries dont les pilotes seraient verrouillés.
    # Comme le choix du joueur influe sur les exclusions, on fournit pour chaque étape
    # un pool ordonné déterministe ; le frontend filtrera selon les pilotes déjà choisis.
    team_pool_order = TEAM_ENTRIES[:]
    rng.shuffle(team_pool_order)

    return {
        "seed": seed,
        "car1": cars[0],
        "car2": cars[1],
        "team_pool_order": [t["id"] for t in team_pool_order],
    }


@app.post("/daily/teams")
def daily_teams(body: dict):
    """Pour la daily : renvoie la prochaine paire d'écuries selon l'ordre déterministe du jour,
    en sautant les écuries contenant un pilote déjà choisi."""
    chosen_pilot_ids = body.get("chosen_pilot_ids", [])
    pool_order = body.get("team_pool_order", [])  # liste d'IDs fournie par /daily
    taken = chosen_names(chosen_pilot_ids)

    teams_by_id = {t["id"]: t for t in TEAM_ENTRIES}
    available = []
    for tid in pool_order:
        t = teams_by_id.get(tid)
        if not t:
            continue
        if any(p["name"] in taken for p in t["pilots"]):
            continue
        available.append(t)
        if len(available) == 2:
            break

    if len(available) < 2:
        return {"error": "Not enough teams available"}
    return {"team1": available[0], "team2": available[1]}


@app.post("/simulate")
def run_simulation(body: dict):
    return simulate_race(body)
