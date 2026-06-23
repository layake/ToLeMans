"""Système de coûts pour le budget : note + bonus historique/légende."""

# Voitures historiquement vainqueurs : bonus de prestige
WINNER_CARS = {
    'Mazda 787B', 'Ferrari 375 Plus', 'Jaguar D-Type', 'Ferrari 250 TR',
    'Aston Martin DBR1', 'Ferrari 330 P4', 'Ford GT40 Mk IV', 'Porsche 917K',
    'Porsche 936', 'Renault Alpine A442B', 'Porsche 956', 'Porsche 962C',
    'Sauber-Mercedes C9', 'Peugeot 905 Evo 1B', 'McLaren F1 GTR',
    'Porsche 911 GT1-98', 'BMW V12 LMR', 'Audi R8', 'Bentley Speed 8',
    'Audi R10 TDI', 'Peugeot 908 HDi', 'Audi R15 TDI Plus',
    'Audi R18 e-tron quattro', 'Porsche 919 Hybrid', 'Toyota TS050 Hybrid',
    'Toyota GR010 Hybrid', 'Ferrari 499P',
}

# Pilotes légendaires : bonus prestige fixé manuellement
LEGEND_PILOT_BONUS = {
    'Tom Kristensen': 25, 'Jacky Ickx': 25, 'Fernando Alonso': 22,
    'Stirling Moss': 18, 'Derek Bell': 18, 'Allan McNish': 15,
    'André Lotterer': 15, 'Jo Siffert': 15, 'Dan Gurney': 15,
    'Pedro Rodríguez': 15, 'Phil Hill': 12, 'Bruce McLaren': 12,
    'O. Gendebien': 12, 'Brian Redman': 10, 'Vic Elford': 10,
    'Yannick Dalmas': 10, 'Sébastien Buemi': 12, 'Timo Bernhard': 10,
    'A. Pier Guidi': 10, 'Robert Kubica': 10, 'Frank Biela': 10,
    'Emanuele Pirro': 10,
}

# DT légendaires
LEGEND_DIRECTOR_BONUS = {
    'Norbert Singer': 15, 'John Wyer': 12, 'André de Cortanze': 10,
    'Leena Gade': 12, 'Ross Brawn': 10, 'Hughes de Chaunac': 8,
}


def pilot_rating(p):
    return round(p['pace']*0.3 + p['night_skill']*0.25 + p['endurance']*0.25 + p['reliability']*0.2)


def car_rating(c):
    return round(c['performance']*0.5 + c['reliability']*0.5)


def car_cost(c):
    """Coût d'une voiture en M€."""
    base = max(5, round((car_rating(c) - 60) * 2.2))
    if c['name'] in WINNER_CARS:
        base = round(base * 1.3)
    return base


def pilot_cost(p):
    """Coût d'un pilote en M€."""
    base = max(3, round((pilot_rating(p) - 60) * 1.6))
    base += LEGEND_PILOT_BONUS.get(p['name'], 0)
    return base


def director_cost(d):
    """Coût d'un DT en M€."""
    return 15 + LEGEND_DIRECTOR_BONUS.get(d['name'], 0)


def team_entry_cost(team):
    """Coût total d'une écurie (somme des 3 pilotes)."""
    return sum(pilot_cost(p) for p in team['pilots'])
