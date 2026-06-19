from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import random
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

    # Exclude teams that contain ANY already-chosen pilot
    available = [
        t for t in TEAM_ENTRIES
        if not any(p["id"] in chosen_pilot_ids for p in t["pilots"])
    ]

    if len(available) < 2:
        return {"error": "Not enough teams available", "available": len(available)}

    selected = random.sample(available, 2)
    return {"team1": selected[0], "team2": selected[1]}


@app.post("/simulate")
def run_simulation(body: dict):
    return simulate_race(body)
