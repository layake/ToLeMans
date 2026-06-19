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

with open("data/pilots.json") as f:
    PILOTS = json.load(f)

with open("data/directors.json") as f:
    DIRECTORS = json.load(f)


@app.get("/health")
def health():
    return {"status": "ok", "cars": len(CARS), "pilots": len(PILOTS), "directors": len(DIRECTORS)}


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


@app.post("/draw/pilot")
def draw_pilot(body: dict):
    exclude = body.get("exclude", [])
    available = [p for p in PILOTS if p["id"] not in exclude]
    if not available:
        return {"error": "No pilots available"}
    return random.choice(available)


@app.post("/simulate")
def run_simulation(body: dict):
    return simulate_race(body)
