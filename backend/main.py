from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import random
from datetime import date
from simulation import simulate_race

app = FastAPI(title="TLM – Vers Le Mans API")

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
    return DIRECTORS


@app.post("/draw/car")
def draw_car(body: dict):
    exclude = body.get("exclude", [])
    available = [c for c in CARS if c["id"] not in exclude]
    if not available:
        return {"error": "No cars available"}
    return random.choice(available)


@app.post("/draw/teams")
def draw_teams(body: dict):
    """Draw 2 team entries, excluding any team that contains an already-chosen pilot."""
    chosen_pilot_ids = body.get("chosen_pilot_ids", [])
    available = [
        t for t in TEAM_ENTRIES
        if not any(p["id"] in chosen_pilot_ids for p in t["pilots"])
    ]
    if len(available) < 2:
        return {"error": "Not enough teams available", "available": len(available)}
    selected = random.sample(available, 2)
    return {"team1": selected[0], "team2": selected[1]}


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

    teams_by_id = {t["id"]: t for t in TEAM_ENTRIES}
    available = []
    for tid in pool_order:
        t = teams_by_id.get(tid)
        if not t:
            continue
        if any(p["id"] in chosen_pilot_ids for p in t["pilots"]):
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
