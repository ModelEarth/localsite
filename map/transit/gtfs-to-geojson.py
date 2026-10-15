"""Convert a GTFS feed's route shapes to simplified GeoJSON line layers for localsite maps.

Usage:
  python3 gtfs-to-geojson.py <unzipped GTFS folder> <output folder> <prefix>

Writes <prefix>-rail.geojson (subway, rail and streetcar: route_type 0, 1, 2) and
<prefix>-bus.geojson (route_type 3). Each route keeps every distinct shape its trips use in
direction 0, plus direction 1 shapes that leave those streets (one-way street pairs, loops and
terminal turnarounds), so branches and both streets are kept while return trips over the same
streets are dropped. Kept shapes are drawn whole, so lines aren't broken where they overlap.
Lines are simplified (Douglas-Peucker) and coordinates rounded to keep the files small.

Rail lines that share track get an "offset" property (in line widths), so maps can draw them side by side
(localsite/js/localsite.js uses Leaflet.PolylineOffset). Each rail line is also oriented the same way
(north to south, or west to east), since offsets are to the side of the direction of travel.

MARTA's feed: https://itsmarta.com/google_transit_feed/google_transit.zip
Uses only the Python standard library.
"""
import csv
import json
import math
import os
import sys
from collections import defaultdict

RAIL_TYPES = {'0', '1', '2'}
BUS_TYPES = {'3'}
TOLERANCE = 0.00004  # Degrees, about 4 meters
DECIMALS = 5
SHARED_DISTANCE = 0.0004  # Degrees, about 40 meters: points this close are on the same track
SHARED_FRACTION = 0.1  # Lines share track when this share of either line's points are close
MIN_STRETCH_METERS = 60  # Direction 1 shapes are kept when they leave direction 0's streets for this far
RETRACE_DISTANCE = 0.00012  # Degrees, about 13 meters: a direction 1 point this close retraces direction 0


def simplify(points, tolerance):
    """Douglas-Peucker line simplification on (lon, lat) points."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        start, end = stack.pop()
        (x1, y1), (x2, y2) = points[start], points[end]
        dx, dy = x2 - x1, y2 - y1
        length_sq = dx * dx + dy * dy
        max_dist, index = 0.0, None
        for i in range(start + 1, end):
            px, py = points[i]
            if length_sq == 0:
                dist = (px - x1) ** 2 + (py - y1) ** 2
            else:
                t = max(0.0, min(1.0, ((px - x1) * dx + (py - y1) * dy) / length_sq))
                dist = (px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2
            if dist > max_dist:
                max_dist, index = dist, i
        if index is not None and max_dist > tolerance * tolerance:
            keep[index] = True
            stack.append((start, index))
            stack.append((index, end))
    return [p for p, k in zip(points, keep) if k]


def orient(lines):
    """Orients every line the same way along the route's main axis: north to south, or west to east."""
    longest = max(lines, key=len)
    north_south = abs(longest[0][1] - longest[-1][1]) > abs(longest[0][0] - longest[-1][0])
    oriented = []
    for line in lines:
        backwards = line[0][1] < line[-1][1] if north_south else line[0][0] > line[-1][0]
        oriented.append(list(reversed(line)) if backwards else line)
    return oriented


def shared_fraction(points, other_cells):
    """Share of points within SHARED_DISTANCE of the other line's points (bucketed into grid cells)."""
    close = sum(1 for lon, lat in points if is_covered(lon, lat, other_cells))
    return close / len(points) if points else 0


def assign_offsets(rail_points, route_types):
    """Offsets for rail lines that share track: each group of lines is spread around the track's center,
    e.g. -0.5 and 0.5 for two lines. Only lines of the same route_type share track, so a streetcar
    on the street above a subway keeps its own place. Returns {route_id: offset}."""
    cells = {rid: {cell(lon, lat) for lon, lat in pts} for rid, pts in rail_points.items()}
    ids = sorted(rail_points)
    neighbors = {rid: set() for rid in ids}
    for i, a in enumerate(ids):
        for b in ids[i + 1:]:
            if route_types[a] == route_types[b] and max(shared_fraction(rail_points[a], cells[b]), shared_fraction(rail_points[b], cells[a])) >= SHARED_FRACTION:
                neighbors[a].add(b)
                neighbors[b].add(a)
    offsets, seen = {}, set()
    for rid in ids:
        if rid in seen:
            continue
        group, stack = [], [rid]
        while stack:
            current = stack.pop()
            if current in seen:
                continue
            seen.add(current)
            group.append(current)
            stack.extend(neighbors[current])
        group.sort()
        for index, member in enumerate(group):
            offsets[member] = index - (len(group) - 1) / 2
    return offsets


def cell(lon, lat, size=SHARED_DISTANCE):
    return (int(lon / size), int(lat / size))


def is_covered(lon, lat, cells, size=SHARED_DISTANCE):
    """True when a point is in or next to one of the grid cells (cells of the given size in degrees)."""
    cx, cy = cell(lon, lat, size)
    return any((cx + dx, cy + dy) in cells for dx in (-1, 0, 1) for dy in (-1, 0, 1))


def meters(points):
    return sum(math.hypot((b[0] - a[0]) * 111320 * math.cos(math.radians(a[1])), (b[1] - a[1]) * 110574)
               for a, b in zip(points, points[1:]))


def densify(points, step_meters=8):
    """Adds points along long segments, so coverage is measured along the line and not only at its vertices."""
    dense = points[:1]
    for a, b in zip(points, points[1:]):
        steps = max(1, int(meters([a, b]) / step_meters))
        dense.extend((a[0] + (b[0] - a[0]) * i / steps, a[1] + (b[1] - a[1]) * i / steps) for i in range(1, steps + 1))
    return dense


def has_uncovered_stretch(points, cells):
    """True when the line has a stretch of at least MIN_STRETCH_METERS away from the covered cells."""
    stretch = []
    for point in densify(points) + [None]:
        if point is not None and not is_covered(point[0], point[1], cells, RETRACE_DISTANCE):
            stretch.append(point)
            continue
        if len(stretch) > 1 and meters(stretch) >= MIN_STRETCH_METERS:
            return True
        stretch = []
    return False


def read_csv(folder, name):
    with open(os.path.join(folder, name), newline='', encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def main(feed, out_dir, prefix):
    routes = {r['route_id']: r for r in read_csv(feed, 'routes.txt')}
    agency = read_csv(feed, 'agency.txt')[0].get('agency_name', '')

    forward, backward = defaultdict(set), defaultdict(set)
    for trip in read_csv(feed, 'trips.txt'):
        if trip.get('shape_id'):
            (backward if trip.get('direction_id') == '1' else forward)[trip['route_id']].add(trip['shape_id'])

    needed = set().union(*forward.values(), *backward.values())
    shape_points = defaultdict(list)
    for row in read_csv(feed, 'shapes.txt'):
        if row['shape_id'] in needed:
            shape_points[row['shape_id']].append(
                (int(row['shape_pt_sequence']), float(row['shape_pt_lon']), float(row['shape_pt_lat'])))

    # Direction 0 shapes, plus direction 1 shapes that use other streets
    route_pieces = defaultdict(list)
    for route_id in set(forward) | set(backward):
        for shape_id in sorted(forward[route_id]):
            route_pieces[route_id].append([(lon, lat) for _, lon, lat in sorted(shape_points[shape_id])])
        kept_cells = {cell(lon, lat, RETRACE_DISTANCE) for piece in route_pieces[route_id] for lon, lat in densify(piece)}
        for shape_id in sorted(backward[route_id]):
            points = [(lon, lat) for _, lon, lat in sorted(shape_points[shape_id])]
            if has_uncovered_stretch(points, kept_cells):
                route_pieces[route_id].append(points)
                kept_cells |= {cell(lon, lat, RETRACE_DISTANCE) for lon, lat in densify(points)}

    layers = {'rail': [], 'bus': []}
    rail_points = {}
    for route_id, pieces in route_pieces.items():
        route = routes.get(route_id)
        if not route:
            continue
        kind = 'rail' if route['route_type'] in RAIL_TYPES else 'bus' if route['route_type'] in BUS_TYPES else None
        if not kind:
            continue
        lines, seen = [], set()
        for points in pieces:
            line = [[round(lon, DECIMALS), round(lat, DECIMALS)] for lon, lat in simplify(points, TOLERANCE)]
            key = json.dumps(line)
            if len(line) > 1 and key not in seen:
                seen.add(key)
                lines.append(line)
        if not lines:
            continue
        if kind == 'rail':
            lines = orient(lines)
            rail_points[route_id] = [point for piece in pieces for point in piece]
        color = route.get('route_color') or ''
        layers[kind].append({
            'type': 'Feature',
            'properties': {
                'route_id': route_id,
                'name': route.get('route_short_name') or route.get('route_long_name'),
                'long_name': route.get('route_long_name', ''),
                'route_type': int(route['route_type']),
                'color': '#' + color if color else '',
                'url': route.get('route_url', ''),
                'agency': agency,
            },
            'geometry': {'type': 'MultiLineString', 'coordinates': lines},
        })

    offsets = assign_offsets(rail_points, {rid: routes[rid]['route_type'] for rid in rail_points})
    for feature in layers['rail']:
        feature['properties']['offset'] = offsets.get(feature['properties']['route_id'], 0)

    for kind, features in layers.items():
        features.sort(key=lambda f: (f['properties']['route_type'], f['properties']['name'].zfill(4)))
        path = os.path.join(out_dir, '%s-%s.geojson' % (prefix, kind))
        with open(path, 'w') as f:
            json.dump({'type': 'FeatureCollection', 'features': features}, f, separators=(',', ':'))
        print('%s: %d routes, %d KB' % (path, len(features), os.path.getsize(path) // 1024))


if __name__ == '__main__':
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
