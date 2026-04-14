"""
Run: python -m app.seed
Seeds the DB with categories, shops, and products.
"""
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, create_tables
from app.models.shop import Shop, ShopCategory
from app.models.product import Product
from app.models.user import User
from app.core.security import hash_password

CATEGORIES = [
    {"name": "Groceries",  "icon": "🛒", "color": "#16A34A"},
    {"name": "Vegetables", "icon": "🥦", "color": "#84CC16"},
    {"name": "Meat",       "icon": "🥩", "color": "#DC2626"},
    {"name": "Medicines",  "icon": "💊", "color": "#2563EB"},
    {"name": "Clothing",   "icon": "👕", "color": "#9333EA"},
]

SHOPS = [
    # ── Hyderabad shops ──────────────────────────────────────────────────────
    {"name": "Fresh Basket",     "category": "Groceries",  "owner_name": "Ravi Kumar",    "address": "Banjara Hills, Hyderabad",   "latitude": 17.4126, "longitude": 78.4483, "rating": 4.5, "total_reviews": 230, "delivery_time_min": 25, "delivery_fee": 20, "description": "Your daily grocery needs, delivered fresh."},
    {"name": "Green Veggies",    "category": "Vegetables", "owner_name": "Sunita Devi",   "address": "Jubilee Hills, Hyderabad",   "latitude": 17.4239, "longitude": 78.4073, "rating": 4.7, "total_reviews": 180, "delivery_time_min": 20, "delivery_fee": 15, "description": "Farm-fresh vegetables every morning."},
    {"name": "Meat Masters",     "category": "Meat",       "owner_name": "Khalid Sheikh",  "address": "Tolichowki, Hyderabad",     "latitude": 17.3927, "longitude": 78.4219, "rating": 4.3, "total_reviews": 95,  "delivery_time_min": 35, "delivery_fee": 30, "description": "Quality cuts, halal certified."},
    {"name": "MedEasy Pharmacy", "category": "Medicines",  "owner_name": "Dr. Priya",     "address": "Madhapur, Hyderabad",       "latitude": 17.4486, "longitude": 78.3908, "rating": 4.8, "total_reviews": 310, "delivery_time_min": 15, "delivery_fee": 10, "description": "24/7 medicines and health essentials."},
    {"name": "StyleZone",        "category": "Clothing",   "owner_name": "Anand Sharma",  "address": "Ameerpet, Hyderabad",       "latitude": 17.4374, "longitude": 78.4487, "rating": 4.2, "total_reviews": 120, "delivery_time_min": 40, "delivery_fee": 25, "description": "Trendy fashion for the whole family."},

    # ── Nagaram / Karimnagar shops ───────────────────────────────────────────
    {"name": "Nagaram Kirana",   "category": "Groceries",  "owner_name": "Suresh Reddy",  "address": "Nagaram, Karimnagar",       "latitude": 18.6530, "longitude": 79.6681, "rating": 4.3, "total_reviews": 85,  "delivery_time_min": 20, "delivery_fee": 15, "description": "Fresh groceries at your doorstep in Nagaram."},
    {"name": "Hari Vegetables",  "category": "Vegetables", "owner_name": "Hari Prasad",   "address": "Nagaram Main Road, Karimnagar", "latitude": 18.6545, "longitude": 79.6695, "rating": 4.5, "total_reviews": 62,  "delivery_time_min": 15, "delivery_fee": 10, "description": "Daily fresh vegetables from local farms."},
    {"name": "Karimnagar Meats", "category": "Meat",       "owner_name": "Mohammed Ali",  "address": "Karimnagar Town",           "latitude": 18.4386, "longitude": 79.1288, "rating": 4.1, "total_reviews": 48,  "delivery_time_min": 30, "delivery_fee": 20, "description": "Fresh meat, halal certified."},
    {"name": "Sri Medicals",     "category": "Medicines",  "owner_name": "Dr. Lakshmi",   "address": "Nagaram, Karimnagar",       "latitude": 18.6520, "longitude": 79.6670, "rating": 4.6, "total_reviews": 110, "delivery_time_min": 10, "delivery_fee": 8,  "description": "Your local pharmacy, open 24/7."},
    {"name": "Fashion Hub",      "category": "Clothing",   "owner_name": "Preethi Rao",   "address": "Nagaram Center, Karimnagar","latitude": 18.6555, "longitude": 79.6710, "rating": 4.0, "total_reviews": 35,  "delivery_time_min": 45, "delivery_fee": 20, "description": "Latest fashion for the whole family."},
]

PRODUCTS = {
    "Fresh Basket": [
        {"name": "Basmati Rice 1kg",     "price": 89,   "original_price": 110,  "unit": "kg",    "description": "Premium long grain basmati"},
        {"name": "Sunflower Oil 1L",     "price": 140,  "original_price": None, "unit": "litre", "description": "Refined sunflower oil"},
        {"name": "Toor Dal 500g",        "price": 75,   "original_price": 90,   "unit": "pack",  "description": "Split pigeon peas"},
        {"name": "Whole Wheat Atta 5kg", "price": 220,  "original_price": None, "unit": "pack",  "description": "100% whole wheat flour"},
    ],
    "Green Veggies": [
        {"name": "Tomatoes",     "price": 30, "original_price": None, "unit": "kg",    "description": "Fresh vine tomatoes"},
        {"name": "Spinach",      "price": 20, "original_price": None, "unit": "piece", "description": "One bunch of fresh spinach"},
        {"name": "Onions 1kg",   "price": 35, "original_price": None, "unit": "kg",    "description": "Red onions"},
        {"name": "Capsicum Mix", "price": 55, "original_price": 70,   "unit": "kg",    "description": "Red, yellow & green"},
    ],
    "Meat Masters": [
        {"name": "Chicken Breast 500g",   "price": 180, "original_price": None, "unit": "pack", "description": "Boneless, skinless"},
        {"name": "Mutton Curry Cut 500g", "price": 380, "original_price": 420,  "unit": "pack", "description": "Fresh goat meat"},
        {"name": "Eggs (12 pack)",        "price": 95,  "original_price": None, "unit": "pack", "description": "Farm fresh eggs"},
        {"name": "Fish Fillet 500g",      "price": 250, "original_price": None, "unit": "pack", "description": "Cleaned Rohu fillet"},
    ],
    "MedEasy Pharmacy": [
        {"name": "Paracetamol 500mg (10s)", "price": 15,   "original_price": None, "unit": "pack",  "description": "Fever & pain relief"},
        {"name": "Vitamin C 1000mg (30s)",  "price": 250,  "original_price": 299,  "unit": "pack",  "description": "Immunity booster"},
        {"name": "Hand Sanitizer 200ml",    "price": 85,   "original_price": None, "unit": "piece", "description": "99.9% germ kill"},
        {"name": "BP Monitor",             "price": 1299, "original_price": 1599, "unit": "piece", "description": "Digital arm cuff"},
    ],
    "StyleZone": [
        {"name": "Men's Cotton Shirt", "price": 499,  "original_price": 799,  "unit": "piece", "description": "Slim fit, multiple colors"},
        {"name": "Women's Kurti",      "price": 599,  "original_price": None, "unit": "piece", "description": "Rayon fabric, S-XXL"},
        {"name": "Kids T-Shirt",       "price": 249,  "original_price": 349,  "unit": "piece", "description": "100% cotton, 2-12 yrs"},
        {"name": "Denim Jeans",        "price": 999,  "original_price": 1499, "unit": "piece", "description": "Stretch denim, all sizes"},
    ],
    "Nagaram Kirana": [
        {"name": "Sona Masoori Rice 1kg", "price": 65,  "original_price": 80,   "unit": "kg",    "description": "Local variety rice"},
        {"name": "Groundnut Oil 1L",      "price": 160, "original_price": None, "unit": "litre", "description": "Cold pressed groundnut oil"},
        {"name": "Chana Dal 500g",        "price": 70,  "original_price": 85,   "unit": "pack",  "description": "Split chickpeas"},
        {"name": "Mirchi Powder 200g",    "price": 45,  "original_price": None, "unit": "pack",  "description": "Spicy red chilli powder"},
    ],
    "Hari Vegetables": [
        {"name": "Brinjal 500g",    "price": 25, "original_price": None, "unit": "pack", "description": "Fresh local brinjal"},
        {"name": "Drumstick",       "price": 20, "original_price": None, "unit": "piece","description": "Fresh drumstick"},
        {"name": "Green Chillies",  "price": 15, "original_price": None, "unit": "pack", "description": "100g fresh green chillies"},
        {"name": "Curry Leaves",    "price": 5,  "original_price": None, "unit": "piece","description": "Fresh curry leaves bunch"},
    ],
    "Karimnagar Meats": [
        {"name": "Chicken Full 1kg",  "price": 220, "original_price": None, "unit": "kg",   "description": "Farm fresh chicken"},
        {"name": "Mutton 500g",       "price": 400, "original_price": 450,  "unit": "pack", "description": "Fresh goat mutton"},
        {"name": "Eggs (6 pack)",     "price": 50,  "original_price": None, "unit": "pack", "description": "Farm fresh eggs"},
    ],
    "Sri Medicals": [
        {"name": "Dolo 650mg (10s)",      "price": 30,  "original_price": None, "unit": "pack",  "description": "Fever & pain relief"},
        {"name": "ORS Powder",            "price": 25,  "original_price": None, "unit": "pack",  "description": "Oral rehydration salts"},
        {"name": "Bandage Roll",          "price": 35,  "original_price": None, "unit": "piece", "description": "Crepe bandage 4 inch"},
        {"name": "Digital Thermometer",   "price": 199, "original_price": 299,  "unit": "piece", "description": "Fast read thermometer"},
    ],
    "Fashion Hub": [
        {"name": "Cotton Saree",       "price": 599, "original_price": 899,  "unit": "piece", "description": "Pure cotton, multiple designs"},
        {"name": "Men's Lungi",        "price": 199, "original_price": None, "unit": "piece", "description": "Soft cotton lungi"},
        {"name": "Kids Frock",         "price": 299, "original_price": 399,  "unit": "piece", "description": "Colorful cotton frock"},
    ],
}


async def run_seed() -> dict:
    summary = {"categories": 0, "shops": 0, "products": 0, "users": 0, "skipped": 0}

    await create_tables()
    print("✅ Tables ensured")

    async with AsyncSessionLocal() as db:
        # Demo user
        existing = await db.scalar(select(User).where(User.email == "demo@localwala.in"))
        if not existing:
            db.add(User(
                name="Demo User",
                email="demo@localwala.in",
                phone="9876543210",
                hashed_password=hash_password("demo1234"),
                address="Nagaram, Karimnagar",
                latitude=18.6530,
                longitude=79.6681,
            ))
            await db.flush()
            summary["users"] += 1
            print("✅ Demo user → demo@localwala.in / demo1234")

        # Categories
        cat_map: dict[str, int] = {}
        for c in CATEGORIES:
            existing_cat = await db.scalar(select(ShopCategory).where(ShopCategory.name == c["name"]))
            if not existing_cat:
                cat = ShopCategory(name=c["name"], icon=c["icon"], color=c["color"])
                db.add(cat)
                await db.flush()
                cat_map[c["name"]] = cat.id
                summary["categories"] += 1
                print(f"  ➕ Category: {c['name']}")
            else:
                cat_map[c["name"]] = existing_cat.id

        # Shops + Products
        for s in SHOPS:
            existing_shop = await db.scalar(select(Shop).where(Shop.name == s["name"]))
            if existing_shop:
                summary["skipped"] += 1
                print(f"  ✔  Shop exists: {s['name']}")
                continue

            shop = Shop(
                name=s["name"],
                description=s.get("description"),
                category_id=cat_map[s["category"]],
                owner_name=s["owner_name"],
                address=s["address"],
                latitude=s["latitude"],
                longitude=s["longitude"],
                rating=s["rating"],
                total_reviews=s["total_reviews"],
                delivery_time_min=s["delivery_time_min"],
                delivery_fee=s["delivery_fee"],
                is_open=True,
                is_active=True,
            )
            db.add(shop)
            await db.flush()
            summary["shops"] += 1
            print(f"  🏪 Shop: {s['name']}  ({s['address']})")

            for p in PRODUCTS.get(s["name"], []):
                db.add(Product(
                    shop_id=shop.id,
                    name=p["name"],
                    price=p["price"],
                    original_price=p.get("original_price"),
                    unit=p["unit"],
                    description=p.get("description"),
                    is_available=True,
                    stock=100,
                ))
                summary["products"] += 1

            await db.flush()
            print(f"     📦 {len(PRODUCTS.get(s['name'], []))} products")

        await db.commit()

    print(f"\n🎉 Seed complete! {summary}")
    return summary


if __name__ == "__main__":
    asyncio.run(run_seed())