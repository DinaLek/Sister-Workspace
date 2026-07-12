#!/usr/bin/env python3
"""
refresh_diet_angel.py
מרענן נתוני Meta Ads ומעדכן את data.json של דשבורד דיאט אנג'ל.
מבנה חדש: multi-period (month, 7d, prev_month, 30d, 3m).
5 סוגי קמפיין: תכנית נשים, תכנית גברים, וובינר, אתגר, חשיפה.
"""
import os, sys, json, requests
from datetime import datetime, timezone, timedelta
from calendar import monthrange

TOKEN      = os.environ.get("META_ACCESS_TOKEN", "")
ACCOUNT_ID = "1637646466672121"
PROGRAM_ID = "120241650957140364"   # הרשמה לתכנית - טופס לידים (women's program)
MEN_ID     = "120248829038760364"   # תכנית לגברים | טופס לידים
API        = "https://graph.facebook.com/v21.0"
OUT_PATH   = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..",
    "clients", "דיאט אנגל",
    "dashboard", "data.json"
)

if not TOKEN:
    print("ERROR: META_ACCESS_TOKEN is not set.", file=sys.stderr)
    sys.exit(1)


# ── API helper ────────────────────────────────────────────────────────────────
def meta(path, **kw):
    kw["access_token"] = TOKEN
    r = requests.get(f"{API}{path}", params=kw, timeout=30)
    try:
        r.raise_for_status()
    except Exception:
        print(f"API error on {path}: {r.text}", file=sys.stderr)
        raise
    return r.json()


# ── Value extractors ──────────────────────────────────────────────────────────
def lead_count(item):
    for a in item.get("actions", []):
        if a.get("action_type") in (
            "lead", "onsite_conversion.lead_grouped",
            "complete_registration", "offsite_conversion.fb_pixel_lead",
        ):
            return int(float(a["value"]))
    return 0


def cpl_val(item):
    for c in item.get("cost_per_action_type", []):
        if c.get("action_type") in (
            "lead", "onsite_conversion.lead_grouped",
            "complete_registration", "offsite_conversion.fb_pixel_lead",
        ):
            return round(float(c["value"]), 2)
    return 0.0


def safe_int(v):
    try:
        return int(str(v).replace(",", ""))
    except Exception:
        return 0


def safe_float(v, dec=2):
    try:
        return round(float(str(v).replace(",", "")), dec)
    except Exception:
        return 0.0


def dd_mm_yyyy(s):
    try:
        d = datetime.strptime(s, "%Y-%m-%d")
        return f"{d.day:02d}.{d.month:02d}.{d.year}"
    except Exception:
        return s


def dd_mm(s):
    try:
        d = datetime.strptime(s, "%Y-%m-%d")
        return f"{d.day:02d}.{d.month:02d}"
    except Exception:
        return s


def st_heb(s):
    return "פעיל" if s == "ACTIVE" else "מושהה"


# ── Campaign classification ───────────────────────────────────────────────────
WOMEN_PROGRAM_ID = PROGRAM_ID
# Additional women's program campaign IDs (landing page variants etc.)
WOMEN_PROGRAM_NAMES = ["הרשמה לתכנית", "תכנית", "קמפיין תכנית"]
MEN_KEYWORDS       = ["גברים", "men", "male"]
WEBINAR_KEYWORDS   = ["וובינר", "webinar", "הרשמה לוובינר"]
CHALLENGE_KEYWORDS = ["אתגר", "challenge"]
EXPOSURE_KEYWORDS  = ["חשיפה", "exposure", "brand"]


def classify(cid, name):
    n = name.lower()
    # Men's program by campaign ID or name
    if cid == MEN_ID or any(k in name for k in MEN_KEYWORDS):
        return "תכנית גברים"
    # Women's program by ID or name patterns
    if cid == WOMEN_PROGRAM_ID or any(k in name for k in WOMEN_PROGRAM_NAMES):
        return "תכנית נשים"
    if any(k in name for k in WEBINAR_KEYWORDS):
        return "וובינר"
    if any(k in name for k in CHALLENGE_KEYWORDS):
        return "אתגר"
    return "חשיפה"


TYPE_COLORS = {
    "תכנית נשים": "#7F77DD",
    "תכנית גברים": "#BA7517",
    "וובינר":     "#1D9E75",
    "אתגר":       "#D85A30",
    "חשיפה":      "#888780",
}

AUD_ORDER  = ["נשים כללי", "גיל המעבר", "אחרי לידה", "גברים"]
AUD_COLORS = {
    "נשים כללי": "#378ADD",
    "גיל המעבר": "#D4537E",
    "אחרי לידה": "#1D9E75",
    "גברים":     "#BA7517",
}


def aud_from_adset(name):
    if any(x in name for x in ("גיל המעבר", "מעבר")):
        return "גיל המעבר"
    if any(x in name for x in ("אחרי לידה", "לידה", "postpartum")):
        return "אחרי לידה"
    if any(x in name for x in ("גברים", "men", "male")):
        return "גברים"
    return "נשים כללי"


def aud_from_campaign(name):
    if any(x in name for x in ("גיל המעבר", "מעבר")):
        return "גיל המעבר", "#D4537E"
    if any(x in name for x in ("אחרי לידה", "לידה", "postpartum")):
        return "אחרי לידה", "#1D9E75"
    if any(x in name for x in ("גברים", "men", "male")):
        return "גברים", "#BA7517"
    return "כללי", "#D85A30"


# ── Fetch helpers ─────────────────────────────────────────────────────────────
INSIGHT_FIELDS = (
    "campaign_id,campaign_name,spend,impressions,clicks,ctr,"
    "actions,cost_per_action_type,reach"
)
ADSET_FIELDS = (
    "adset_id,adset_name,campaign_id,spend,impressions,clicks,ctr,"
    "actions,cost_per_action_type"
)


def fetch_campaigns(date_preset=None, since=None, until=None):
    kw = dict(
        level="campaign",
        fields=INSIGHT_FIELDS,
        sort="spend_descending",
        limit=50,
        action_attribution_windows=json.dumps(["7d_click", "1d_view"]),
    )
    if date_preset:
        kw["date_preset"] = date_preset
    else:
        kw["time_range"] = json.dumps({"since": since, "until": until})
    return meta(f"/act_{ACCOUNT_ID}/insights", **kw).get("data", [])


def fetch_adsets(date_preset=None, since=None, until=None):
    kw = dict(
        level="adset",
        fields=ADSET_FIELDS,
        filtering=json.dumps(
            [{"field": "campaign.id", "operator": "IN", "value": [PROGRAM_ID]}]
        ),
        sort="spend_descending",
        limit=30,
        action_attribution_windows=json.dumps(["7d_click", "1d_view"]),
    )
    if date_preset:
        kw["date_preset"] = date_preset
    else:
        kw["time_range"] = json.dumps({"since": since, "until": until})
    return meta(f"/act_{ACCOUNT_ID}/insights", **kw).get("data", [])


def fetch_adset_statuses():
    r = meta(f"/{PROGRAM_ID}/adsets", fields="id,name,status", limit=30)
    return {a["id"]: a.get("status", "PAUSED") for a in r.get("data", [])}


def fetch_campaign_statuses():
    r = meta(f"/act_{ACCOUNT_ID}/campaigns", fields="id,name,status,effective_status", limit=100)
    return {
        c["id"]: {"status": c.get("effective_status", c.get("status", "PAUSED")), "name": c.get("name", "")}
        for c in r.get("data", [])
    }


# ── Process one period ────────────────────────────────────────────────────────
def process_period(camp_rows, adset_rows, adset_status_map, camp_status_map, date_preset=None, since=None, until=None):
    if not camp_rows:
        return None

    date_from = camp_rows[0].get("date_start", since or "")
    date_to   = camp_rows[0].get("date_stop",  until or "")
    label = f"{dd_mm(date_from)} – {dd_mm_yyyy(date_to)}" \
        if date_from and date_to else ""

    # Process campaigns
    campaigns = []
    for c in camp_rows:
        cid  = c.get("campaign_id", "")
        name = c.get("campaign_name", "")
        typ  = classify(cid, name)
        cst  = camp_status_map.get(cid, {}).get("status", "PAUSED")
        sp   = safe_float(c.get("spend", 0))
        r    = lead_count(c)
        if typ == "אתגר" and sp > 0 and r == 0:
            print(f"DEBUG אתגר actions for '{name}': {c.get('actions')}", file=sys.stderr)
        campaigns.append({
            "id": cid, "name": name, "type": typ, "status": cst,
            "spend": sp, "impr": safe_int(c.get("impressions", 0)),
            "clicks": safe_int(c.get("clicks", 0)),
            "ctr":  safe_float(c.get("ctr", 0)),
            "results": r, "cpl": cpl_val(c),
            "reach": safe_int(c.get("reach", 0)),
        })

    def camps_of(t):
        return [c for c in campaigns if c["type"] == t]

    def type_totals(t):
        cc = camps_of(t)
        sp = round(sum(c["spend"] for c in cc), 0)
        r  = sum(c["results"] for c in cc)
        return int(sp), r, round(sp / max(r, 1), 2), len(cc)

    wn_sp, wn_r, wn_cpl, wn_n = type_totals("תכנית נשים")
    gm_sp, gm_r, gm_cpl, gm_n = type_totals("תכנית גברים")
    wb_sp, wb_r, wb_cpl, wb_n = type_totals("וובינר")
    ch_sp, ch_r, ch_cpl, ch_n = type_totals("אתגר")
    hp_sp, _,    _,    _     = type_totals("חשיפה")
    hp_reach = sum(c["reach"] for c in camps_of("חשיפה"))

    total_sp     = sum(c["spend"]   for c in campaigns)
    total_results= wn_r + gm_r + wb_r + ch_r
    total_cpl    = round((wn_sp+gm_sp+wb_sp+ch_sp) / max(total_results, 1), 2)
    total_clicks = sum(c["clicks"] for c in campaigns if c["type"] != "חשיפה")
    total_impr   = sum(c["impr"]   for c in campaigns if c["type"] != "חשיפה")
    total_ctr    = safe_float(total_clicks / max(total_impr, 1) * 100)

    active_count = sum(
        1 for c in campaigns
        if c["status"] == "ACTIVE" and c["type"] != "חשיפה"
    )

    # byType array (5 types)
    by_type = [
        {"type": "תכנית נשים", "color": "#7F77DD", "spend": wn_sp, "results": wn_r, "cpl": wn_cpl, "count": max(wn_n, 1)},
        {"type": "תכנית גברים","color": "#BA7517", "spend": gm_sp, "results": gm_r, "cpl": gm_cpl, "count": max(gm_n, 1)},
        {"type": "וובינר",     "color": "#1D9E75", "spend": wb_sp, "results": wb_r, "cpl": wb_cpl, "count": wb_n},
        {"type": "אתגר",       "color": "#D85A30", "spend": ch_sp, "results": ch_r, "cpl": ch_cpl, "count": ch_n},
        {"type": "חשיפה",      "color": "#888780", "spend": int(hp_sp), "results": 0, "cpl": 0, "count": len(camps_of("חשיפה")), "reach": hp_reach},
    ]

    # Challenge campaigns sorted by CPL asc
    ch_camps = sorted(
        [{"n": c["name"], "aud": aud_from_campaign(c["name"])[0],
          "col": aud_from_campaign(c["name"])[1], "st": st_heb(c["status"]),
          "sp": c["spend"], "r": c["results"], "cpl": c["cpl"], "ctr": c["ctr"]}
         for c in camps_of("אתגר")],
        key=lambda x: x["cpl"] if x["cpl"] > 0 else 9999,
    )

    # Webinar campaigns sorted by CPL asc
    wb_camps = sorted(
        [{"n": c["name"], "aud": aud_from_campaign(c["name"])[0],
          "col": aud_from_campaign(c["name"])[1], "st": st_heb(c["status"]),
          "sp": c["spend"], "r": c["results"], "cpl": c["cpl"], "ctr": c["ctr"]}
         for c in camps_of("וובינר")],
        key=lambda x: x["cpl"] if x["cpl"] > 0 else 9999,
    )

    # Adsets (women's program)
    adsets   = []
    aud_agg  = {}
    for a in adset_rows:
        aid   = a.get("adset_id", "")
        st    = adset_status_map.get(aid, "PAUSED")
        sp    = safe_float(a.get("spend", 0))
        r_v   = lead_count(a)
        cpl_v = cpl_val(a)
        ctr_v = safe_float(a.get("ctr", 0))
        aud   = aud_from_adset(a.get("adset_name", ""))
        col   = AUD_COLORS[aud]

        adsets.append({
            "n": a.get("adset_name", ""), "aud": aud, "col": col,
            "st": st_heb(st), "sp": sp, "r": r_v, "cpl": cpl_v, "ctr": ctr_v,
        })
        if sp > 0:
            if aud not in aud_agg:
                aud_agg[aud] = {"spend": 0, "leads": 0}
            aud_agg[aud]["spend"] += sp
            aud_agg[aud]["leads"] += r_v

    # Add men's campaign row to adsets table
    men_camp = next((c for c in camps_of("תכנית גברים")), None)
    if men_camp and men_camp["spend"] > 0:
        adsets.append({
            "n":   men_camp["name"] + " (קמפיין נפרד)",
            "aud": "גברים", "col": "#BA7517",
            "st":  st_heb(men_camp["status"]),
            "sp":  men_camp["spend"], "r": men_camp["results"],
            "cpl": men_camp["cpl"],   "ctr": men_camp["ctr"],
        })
        if "גברים" not in aud_agg:
            aud_agg["גברים"] = {"spend": 0, "leads": 0}
        aud_agg["גברים"]["spend"] += men_camp["spend"]
        aud_agg["גברים"]["leads"] += men_camp["results"]

    adsets.sort(key=lambda x: (0 if x["st"] == "פעיל" else 1, -x["sp"]))

    # Audience KPIs
    aud_kpis = [
        {
            "name":  a,
            "leads": aud_agg.get(a, {}).get("leads", 0),
            "spend": round(aud_agg.get(a, {}).get("spend", 0), 0),
            "cpl":   round(aud_agg.get(a, {}).get("spend", 0) / max(aud_agg.get(a, {}).get("leads", 0), 1), 2),
            "color": AUD_COLORS[a],
        }
        for a in AUD_ORDER
    ]

    return {
        "period":          {"from": date_from, "to": date_to, "label": label},
        "lastUpdated":     datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "activeCampaigns": active_count,
        "overview":        {"spend": int(round(total_sp, 0)), "results": total_results,
                            "cpl": total_cpl, "ctr": total_ctr},
        "byType":          by_type,
        "audiences":       {"kpis": aud_kpis},
        "challenge":       {"spend": ch_sp, "results": ch_r, "cpl": ch_cpl, "count": ch_n, "campaigns": ch_camps},
        "webinar":         {"spend": wb_sp, "results": wb_r, "cpl": wb_cpl, "count": wb_n, "campaigns": wb_camps},
        "adsets":          adsets,
    }


# ── Main ──────────────────────────────────────────────────────────────────────
now    = datetime.now(timezone.utc)
today  = now.date()
y, m   = today.year, today.month
prev_m = m - 1 if m > 1 else 12
prev_y = y if m > 1 else y - 1

PERIODS_DEF = {
    "month":      {"date_preset": "this_month"},
    "7d":         {"date_preset": "last_7d"},
    "prev_month": {
        "since": f"{prev_y}-{prev_m:02d}-01",
        "until": f"{prev_y}-{prev_m:02d}-{monthrange(prev_y, prev_m)[1]:02d}",
    },
    "30d":        {"date_preset": "last_30d"},
    "3m":         {"date_preset": "last_90d"},
}

print("Fetching campaign and adset statuses…")
camp_status_map  = fetch_campaign_statuses()
adset_status_map = fetch_adset_statuses()

periods_out = {}
for name, params in PERIODS_DEF.items():
    print(f"Fetching period: {name}…")
    try:
        camp_rows  = fetch_campaigns(**params)
        adset_rows = fetch_adsets(**params)
        result     = process_period(camp_rows, adset_rows, adset_status_map, camp_status_map, **params)
        if result:
            periods_out[name] = result
            print(f"  ✓ {result['overview']['results']:,} results · ₪{result['overview']['spend']:,} spend")
        else:
            print(f"  ⚠ No data for {name}")
    except Exception as e:
        print(f"  ✗ Error for {name}: {e}", file=sys.stderr)

if not periods_out:
    print(
        "ERROR: every period failed — refusing to overwrite data.json with empty data.",
        file=sys.stderr,
    )
    sys.exit(1)

output = {
    "lastUpdated":     datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "activeCampaigns": periods_out.get("month", {}).get("activeCampaigns", 0),
    "periods":         periods_out,
}

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

month_d = periods_out.get("month", {})
print(
    f"\n✅ data.json updated · "
    f"{month_d.get('overview', {}).get('results', 0):,} results this month · "
    f"₪{month_d.get('overview', {}).get('spend', 0):,} spend · "
    f"{len(periods_out)} periods written"
)
