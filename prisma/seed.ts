import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSeed, resolveProductImage, readNameToImageMap, ensureCategoryPool } from './lib/unsplash-images';
import { pickUnsplashForProduct, buildUnsplashImageUrl } from '../src/lib/unsplash-images';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

// ──────────────────────────────────────────────────────────────
//  DATA TEMPLATES
// ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: "womens",           name: "Women",        desc: "Women's fashion, dresses, tops, bottoms & more" },
  { slug: "mens",             name: "Men",          desc: "Men's clothing, suits, casual wear & accessories" },
  { slug: "kids-baby",        name: "Kids & Baby",  desc: "Clothing and essentials for kids and babies" },
  { slug: "accessories",      name: "Accessories",  desc: "Bags, jewelry, watches, belts and more" },
  { slug: "shoes",            name: "Shoes",        desc: "Footwear for every occasion — heels, sneakers, boots" },
  { slug: "sportswear",       name: "Sportswear",   desc: "Athletic wear, activewear and gym essentials" },
  { slug: "luxury",           name: "Luxury",       desc: "Premium designer collections" },
  { slug: "bags",             name: "Bags",         desc: "Handbags, totes, backpacks and clutches" },
  { slug: "swimwear",         name: "Swimwear",     desc: "Bikinis, swimsuits and beachwear" },
  { slug: "lingerie",         name: "Lingerie",     desc: "Intimates, sleepwear and loungewear" },
  { slug: "formal-wear",      name: "Formal Wear",  desc: "Suits, tuxedos and evening attire" },
  { slug: "outerwear",        name: "Outerwear",    desc: "Coats, jackets and blazers for all seasons" },
];

const BRANDS = [
  "Nike","Adidas","Gucci","Zara","H&M","Puma","Louis Vuitton","Chanel",
  "Dior","Prada","Burberry","Fendi","Versace","Armani","Calvin Klein",
  "Ralph Lauren","Tommy Hilfiger","Levi's","New Balance","The North Face",
  "Coach","Michael Kors","Tory Burch","Steve Madden","Vans","Converse",
  "Dr. Martens","UGG","Kate Spade","Alexander McQueen","Balenciaga",
  "Off-White","Supreme","Givenchy","Loewe","Bottega Veneta","Mango",
  "Massimo Dutti","COS","Arket","Uniqlo","Old Navy","Gap","Banana Republic",
  "Brooks Brothers","Oxford","Fred Perry","Lacoste","Brunello Cucinelli",
  "Moncler","Canada Goose","Arc'teryx","Salomon","Lululemon","Sweaty Betty",
  "Sketchers","Timberland","Clarks","Birkenstock","Teva","Reebok",
];

// Helper: seeded random using mulberry32 so output is deterministic-ish
function makeRng(seed: number) {
  let s = seed;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) & 0xffffffff; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const rng = makeRng(42);
const rand = (min: number, max: number) => min + rng() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => rng() - 0.5);

// ──────────────────────────────────────────────────────────────
//  PRODUCT NAME BUILDERS PER CATEGORY
// ──────────────────────────────────────────────────────────────

const ADJECTIVES = ["Classic","Premium","Modern","Elegant","Vintage","Luxury","Minimalist","Bold","Chic","Trendy","Relaxed","Slim Fit","Oversized","Tailored","Effortless","Romantic","Structured","Flowing","Strappy","Crochet","Knitted","Embroidered","Printed","Solid","Striped","Plaid","Floral","Polka Dot","Graphic"];
const MATERIALS = ["Cotton","Linen","Silk","Wool","Cashmere","Denim","Leather","Suede","Nylon","Polyester","Rayon","Viscose","Modal","Velvet","Tweed","Fleece","Satin","Chiffon","Organza","Denim Blend"];
const COLORS = ["Black","White","Navy","Beige","Brown","Pink","Red","Blue","Green","Yellow","Purple","Gray","Burgundy","Olive","Cream","Khaki","Coral","Mint","Lavender","Mustard","Teal","Charcoal","Dusty Rose","Sage","Blush","Sky Blue","Hot Pink"];
const SIZES = ["XS","S","M","L","XL","XXL","One Size","2T","3T","4T","5","6","7","8","10","12","14","16"];

const PRODUCT_TEMPLATES: Record<string, { names: Array<() => string>; imageSeed: string }> = {
  womens: {
    names: [
      () => `${pick(COLORS)} ${pick(["Fly","Maxi","Bodycon","Wrap","A-Line","Midi","Mini","Shirt","Slip","Shift"])} ${pick(["Dress","Gown"])}`,
      () => `${pick(ADJECTIVES)} ${pick(MATERIALS)} ${pick(["Blouse","Top","Tank","Camisole","Crop Top","Tube Top","Tunic"])}`,
      () => `${pick(ADJECTIVES)} ${pick(["High-Waist","Wide-Leg","Straight","Bootcut","Skinny","Paperbag","Palazzo","Flare"])} ${pick(["Jeans","Pants","Trousers","Leggings","Shorts"])}`,
      () => `${pick(ADJECTIVES)} ${pick(["Cardigan","Sweater","Jacket","Coat","Blazer","Vest","Kimono","Wrap"])}`,
      () => `${pick(COLORS)} ${pick(["Skirt","Mini Skirt","Midi Skirt","Maxi Skirt"])}`,
      () => `${pick(["Floral","Polka Dot","Animal Print","Abstract","Striped","Geo","Tie-Dye","Floral Print"])} ${pick(["Blouse","Dress","Top","Skirt"])}`,
    ],
    imageSeed: "fashion",
  },
  mens: {
    names: [
      () => `${pick(ADJECTIVES)} ${pick(["Fit","Slim","Regular","Relaxed"])} ${pick(["T-Shirt","Shirt","Polo","Henley"])}`,
      () => `${pick(ADJECTIVES)} ${pick(["Jeans","Chinos","Trousers","Cargo Pants","Sweatpants"])}`,
      () => `${pick(ADJECTIVES)} ${pick(["Suit","Blazer","Jacket","Overcoat","Trench Coat","Parka","Puffer Jacket","Bomber Jacket"])}`,
      () => `${pick(["Oxford","Dress","Casual","Linen","Flannel","Denim","Hawaiian"])} ${pick(["Shirt"])}`,
      () => `${pick(ADJECTIVES)} ${pick(["Sweater","Hoodie","Sweatshirt","V-Neck","Crewneck"])}`,
      () => `${pick(["Shorts","Board Shorts","Cargo Shorts"])}`,
    ],
    imageSeed: "men-fashion",
  },
  "kids-baby": {
    names: [
      () => `${pick(["Kids","Baby","Toddler"])} ${pick(["T-Shirt","Onesie","Romper","Jumpsuit","Dress","Pajamas","Set"])}`,
      () => `${pick(ADJECTIVES)} ${pick(["Dress","Outfit","Costume","Uniform"])}`,
      () => `${pick(["Jeans","Leggings","Shorts","Sweatpants"])}`,
      () => `${pick(["Hoodie","Sweater","Jacket","Coat"])}`,
      () => `${pick(["Socks","Hat","Beanie","Cap"])}`,
    ],
    imageSeed: "kids-clothing",
  },
  accessories: {
    names: [
      () => `${pick(ADJECTIVES)} ${pick(["Watch","Sunglasses","Scarf","Belt","Wallet","Bracelet","Necklace","Earrings","Ring","Brooch","Tie","Bow Tie","Pocket Square"])}`,
      () => `${pick(["Gold","Silver","Rose Gold","Platinum","Titanium"])} ${pick(["Watch","Chain","Bangle","Ring"])}`,
      () => `${pick(["Leather","Canvas","Fabric","Metal"])} ${pick(["Belt","Wallet","Keychain"])}`,
      () => `${pick(["Round","Aviator","Cat-Eye","Square","Oval"])} ${pick(["Sunglasses","Glasses"])}`,
      () => `${pick(["Silk","Cashmere","Cotton","Wool","Linen"])} ${pick(["Scarf","Wrap","Stole","Infinity Scarf"])}`,
    ],
    imageSeed: "fashion-accessories",
  },
  shoes: {
    names: [
      () => `${pick(["Classic","Running","Casual","Sport","High-Top","Low-Top"])} ${pick(["Sneakers","Shoes","Trainers"])}`,
      () => `${pick(["High-Heel","Stiletto","Block Heel","Platform","Kitten Heel"])} ${pick(["Pump","Sandals","Mules"])}`,
      () => `${pick(["Ankle","Knee-High","Mid-Calf","Chelsea","Combat"])} ${pick(["Boots"])}`,
      () => `${pick(["Loafer","Oxford","Derby","Moccasin"])}`,
      () => `${pick(["Flip Flop","Slide","Sandals","Espadrille"])}`,
      () => `${pick(["Walking","Hiking","Trail","Running"])} ${pick(["Shoes","Sneakers","Boots"])}`,
    ],
    imageSeed: "shoes",
  },
  sportswear: {
    names: [
      () => `${pick(["Running","Training","Gym","Yoga","Sport"])} ${pick(["T-Shirt","Tank Top","Shirt"])}`,
      () => `${pick([" Joggers","Leggings","Shorts","Sweatpants"])}`,
      () => `${pick(["Sports Bra","Bra Top","Support Bra"])}`,
      () => `${pick(["Jacket","Windbreaker","Track Jacket","Fleece"])}`,
      () => `${pick(["Shorts","Compression Shorts"])}`,
      () => `${pick(["Hoodie","Sweatshirt"])}`,
    ],
    imageSeed: "activewear",
  },
  luxury: {
    names: [
      () => `${pick(ADJECTIVES)} ${pick(["Evening Gown","Cocktail Dress","Clutch","Wrap"])}`,
      () => `${pick(["Silk","Satin","Velvet","Lace","Cashmere"])} ${pick(["Dress","Blouse","Scarf","Coat","Bag"])}`,
      () => `${pick(["Designer","Limited Edition","Handcrafted"])} ${pick(["Bag","Shoes","Jacket","Watch","Jewelry"])}`,
      () => `${pick(["Quilted","Woven","Embossed","Stamped"])} ${pick(["Leather Bag","Wallet","Cardholder"])}`,
      () => `${pick(["Crystal","Diamond","Pearl","Ruby","Sapphire","Emerald"])} ${pick(["Necklace","Earrings","Bracelet","Ring"])}`,
    ],
    imageSeed: "luxury-fashion",
  },
  bags: {
    names: [
      () => `${pick(["Tote","Handbag","Shoulder Bag","Crossbody","Clutch","Satchel","Bucket Bag","Hobo Bag"," Minaudiere"])}`,
      () => `${pick(["Leather","Canvas","Nylon","Suede","Woven"])} ${pick(["Bag","Tote","Backpack"])}`,
      () => `${pick(["Mini","Medium","Large","Oversized"])} ${pick(["Tote","Shopping Bag"])}`,
      () => `${pick(["Travel","Weekender","Duffle","Garment Bag","Cabin"])} ${pick(["Bag","Suitcase"])}`,
      () => `${pick(["Backpack","Rucksack","Laptop Bag"])}`,
    ],
    imageSeed: "handbag",
  },
  swimwear: {
    names: [
      () => `${pick(["Bikini","Swimsuit","One-Piece","Tankini"])}`,
      () => `${pick(["Bandeau","Halter","Triangle","Underwire","Push-Up"])} ${pick(["Bikini Top","Swim Top"])}`,
      () => `${pick(["High-Waist","Boyshort","Brief","String"])} ${pick(["Bikini Bottom","Swim Bottom"])}`,
      () => `${pick(["Cover-Up","Kaftan","Sarong","Parka","Tunic"])}`,
      () => `${pick(["Rash Guard","Swim Shirt"])}`,
    ],
    imageSeed: "swimsuit",
  },
  lingerie: {
    names: [
      () => `${pick(["Bra","Bralette","Teddy","Chemise","Nightgown","Robe","Pajama Set","Sleep Set","Camisole"])}`,
      () => `${pick(["Lace","Cotton","Silk","Satin","Mesh"])} ${pick(["Bra","Brief","Thong","Boyshort","Stockings","Garter Belt","Corset","Bustier"])}`,
      () => `${pick(["Short Set","Long Set","Crop Tee","Sweatpants"])}`,
      () => `${pick(["Slip Dress","Babydoll","Camisole"])}`,
      () => `${pick(["Boxer Briefs","Trunks","Briefs","Boxers"])}`,
    ],
    imageSeed: "lingerie",
  },
  "formal-wear": {
    names: [
      () => `${pick(["Slim Fit","Classic Fit","Modern Fit"])} ${pick(["Suit","Blazer","Tuxedo","Three-Piece Suit"])}`,
      () => `${pick(["Dinner","Tux","Cocktail"])} ${pick(["Shirt","Jacket","Vest"])}`,
      () => `${pick(["Evening","Cocktail","Gala"])} ${pick(["Dress","Gown"])}`,
      () => `${pick([" Waistcoat","Bow Tie","Cufflinks","Pocket Square"])}`,
      () => `${pick(["Sequin","Beaded","Embellished"])} ${pick(["Dress","Gown","Top"])}`,
    ],
    imageSeed: "formal-wear",
  },
  outerwear: {
    names: [
      () => `${pick(["Wool","Cashmere","Cotton","Denim","Leather","Faux Fur","Puffer","Trench","Parka","Peacoat","Bomber","Blazer"])} ${pick(["Coat","Jacket","Blazer"])}`,
      () => `${pick(["Long","Short","Mid-Length"])} ${pick(["Coat","Jacket"])}`,
      () => `${pick(["Windbreaker","Rain Jacket","Shell"])}`,
      () => `${pick(["Fur","Faux Fur","Sherpa","Wool"])} ${pick(["Vest","Cape","Stole"])}`,
      () => `${pick(["Fleece","Down","Softshell"])} ${pick(["Jacket","Parka"])}`,
    ],
    imageSeed: "coat",
  },
};

// ──────────────────────────────────────────────────────────────
//  SEED FUNCTION
// ──────────────────────────────────────────────────────────────
//  SEED FUNCTION
// ──────────────────────────────────────────────────────────────

async function seedProducts() {
  console.log("🌱 Seeding categories...");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { slug: cat.slug, name: cat.name, description: cat.desc, updatedAt: new Date(), createdAt: new Date() },
    });
  }

  console.log("🖼️  Resolving Unsplash product images...");
  const unsplashNameIndex = readNameToImageMap();
  const unsplashCategoryPool = await ensureCategoryPool(CATEGORIES.map(c => c.slug));
  const exactMatches = Object.keys(unsplashNameIndex).length;
  const pooled = Object.keys(unsplashCategoryPool).filter(k => (unsplashCategoryPool[k] ?? []).length > 0).length;
  console.log(`   ✅ ${exactMatches} exact name-matched images ready, ${pooled}/${CATEGORIES.length} category image pools ready`);

  const resolveGallery = (title: string, category: string, seed: number): string[] => {
    const main = resolveProductImage(title, category, seed, unsplashNameIndex, unsplashCategoryPool).mainImage;
    const gallery = [main];
    for (let i = 1; i < 3; i++) {
      const curated = pickUnsplashForProduct(category, title, seed + i * 5);
      gallery.push(buildUnsplashImageUrl(curated.id, { w: 800, h: 1000 }));
    }
    return Array.from(new Set(gallery));
  };

  const now = new Date();

  // Create demo users for reviews
  console.log("👤 Creating demo users...");
  const DEMO_USERS = [
    { id: "demo_user_1", name: "Sarah Johnson", email: "sarah.j@example.com" },
    { id: "demo_user_2", name: "Mike Chen", email: "mike.c@example.com" },
    { id: "demo_user_3", name: "Emma Davis", email: "emma.d@example.com" },
    { id: "demo_user_4", name: "James Wilson", email: "james.w@example.com" },
    { id: "demo_user_5", name: "Lisa Anderson", email: "lisa.a@example.com" },
  ];
  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, clerkId: `clerk_${u.id}`, email: u.email, role: "USER" as any, status: "ACTIVE" as any, sellerStatus: "NONE" as any, createdAt: now, updatedAt: now },
    });
  }
  const customerIds = DEMO_USERS.map(u => u.id);

  console.log("🏷️  Seeding brands...");
  for (const brand of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: brand.toLowerCase().replace(/[^a-z0-9]/g, "-") },
      update: {},
      create: {
        name: brand,
        slug: brand.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: `${brand} — premium fashion brand`,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
  }

  console.log("📦 Generating 1000+ products...");
  const totalTargets = 1000;
  const perCategory = Math.floor(totalTargets / CATEGORIES.length);
  const remainder = totalTargets - perCategory * CATEGORIES.length;

  let created = 0;

  for (let ci = 0; ci < CATEGORIES.length; ci++) {
    const cat = CATEGORIES[ci];
    const count = perCategory + (ci < remainder ? 1 : 0);
    const template = PRODUCT_TEMPLATES[cat.slug];
    if (!template) continue;

    for (let i = 0; i < count; i++) {
      const id = `prod_${String(created).padStart(5, "0")}`;
      const nameBuilder = pick(template.names as Array<() => string>);
      const title = nameBuilder();
      const price = parseFloat(rand(12.99, cat.slug === "luxury" ? 2500 : 400).toFixed(2));
      const hasCompare = rng() > 0.55;
      const compareAtPrice = hasCompare ? parseFloat((price * rand(1.2, 2.2)).toFixed(2)) : null;
      const stock = randInt(0, cat.slug === "luxury" ? 20 : 200);
      const rating = parseFloat(rand(3.5, 5.0).toFixed(1));
      const ratingCount = randInt(0, cat.slug === "luxury" ? 200 : 800);
      const views = randInt(0, 5000);
      const daysAgo = randInt(0, 730);
      const publishedAt = new Date(now.getTime() - daysAgo * 86400000);
      const tagsArr = shuffle([pick(ADJECTIVES), pick(MATERIALS), pick(COLORS), pick(["new","sale","bestseller","limited"])]).slice(0, randInt(2, 5));
      const statusRoll = rng();
      const status = statusRoll > 0.08 ? "PUBLISHED" : statusRoll > 0.04 ? "DRAFT" : "ARCHIVED";
      const brand = pick(BRANDS);

       // Real Unsplash image — matched to the product name (see prisma/lib/unsplash-images.ts)
       const imageSeed = hashSeed(id);
       const productImage = resolveProductImage(title, cat.slug, imageSeed, unsplashNameIndex, unsplashCategoryPool);
       const mainImage = productImage.mainImage;
       const image = productImage.image;
       const gallery = resolveGallery(title, cat.slug, imageSeed);

      await prisma.product.upsert({
        where: { id },
        update: {
          title,
          slug: `${id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`,
          description: generateDescription(cat.slug, title, pick(MATERIALS), pick(COLORS)),
          price,
          compareAtPrice,
          category: cat.slug,
          brand: brand,
          sku: `${cat.slug.toUpperCase().substring(0,3)}-${String(created).padStart(4,"0")}`,
          status: status as any,
          stock,
          rating,
          ratingCount,
          views,
          publishedAt,
          tags: JSON.stringify(tagsArr),
          mainImage,
          image,
          images: JSON.stringify(gallery),
          updatedAt: now,
        },
        create: {
          id,
          title,
          slug: `${id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`,
          description: generateDescription(cat.slug, title, pick(MATERIALS), pick(COLORS)),
          price,
          compareAtPrice,
          category: cat.slug,
          brand: brand,
          sku: `${cat.slug.toUpperCase().substring(0,3)}-${String(created).padStart(4,"0")}`,
          status: status as any,
          stock,
          rating,
          ratingCount,
          views,
          publishedAt,
          tags: JSON.stringify(tagsArr),
          mainImage,
          image,
          images: JSON.stringify(gallery),
          createdAt: now,
          updatedAt: now,
        },
      });

       created++;
    }

    console.log(`   ✅ ${cat.name}: ${count} products`);
  }

  // ── Generate sample reviews ──
  console.log("⭐ Generating sample reviews...");
  const allProducts = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
    take: 200,
  });
  const reviewComments = [
    "Absolutely love this! Great quality and fits perfectly.",
    "Beautiful piece, exactly as described. Fast shipping too!",
    "Good value for the price. Would recommend.",
    " exceeded my expectations! The material is soft and comfortable.",
    "Perfect for the occasion. Received many compliments.",
    "Great fit and true to size. Will buy again!",
    "Stunning design, the colors are even prettier in person.",
    "Comfortable and stylish. My new favorite piece.",
    "High quality craftsmanship. Worth every penny.",
    "Love the details! Looks much more expensive than it is.",
    "Not quite what I expected but still nice quality.",
    "Fast delivery, well packaged. Happy with my purchase!",
    "Classic style that goes with everything in my wardrobe.",
    "The perfect gift! Came beautifully packaged.",
    "Obsessed! Already ordered in another color.",
  ];

  for (const prod of allProducts) {
    const numReviews = randInt(0, 8);
    for (let r = 0; r < numReviews; r++) {
      const userId = pick(customerIds);
      const comment = pick(reviewComments);
      const rating = randInt(3, 5);
      const daysAgo = randInt(1, 365);
      const createdAt = new Date(now.getTime() - daysAgo * 86400000);
      await prisma.review.upsert({
        where: { userId_productId: { userId, productId: prod.id } },
        update: { rating, comment, updatedAt: now },
        create: {
          id: `rev_${crypto.randomUUID()}`,
          userId,
          productId: prod.id,
          rating,
          comment,
          verified: rng() > 0.3,
          isHidden: false,
          helpful: randInt(0, 30),
          createdAt,
          updatedAt: now,
        },
      });
    }
  }

  // Recalculate ratings
  console.log("🔄 Recalculating product ratings...");
  const productsWithReviews = await prisma.review.groupBy({ by: ["productId"], _avg: { rating: true }, _count: { id: true } });
  for (const agg of productsWithReviews) {
    if (!agg._avg.rating) continue;
    await prisma.product.update({
      where: { id: agg.productId },
      data: {
        rating: parseFloat(agg._avg.rating.toFixed(1)),
        ratingCount: agg._count.id,
        updatedAt: now,
      },
    });
  }

  console.log(`\n✅ Done! Created ${created} products across ${CATEGORIES.length} categories.`);
}

function generateDescription(category: string, title: string, material: string, color: string): string {
  const descs: Record<string, string[]> = {
    womens: [
      `Elevate your wardrobe with this stunning ${color.toLowerCase()} ${title.toLowerCase()}. Crafted from premium ${material.toLowerCase()}, this piece combines comfort with sophistication for any occasion.`,
      `A versatile addition to your collection — this ${color.toLowerCase()} ${title.toLowerCase()} features a flattering silhouette and premium ${material.toLowerCase()} construction. Perfect for both casual and dressy occasions.`,
      `Experience the perfect blend of style and comfort with this ${color.toLowerCase()} ${title.toLowerCase()}. Made from luxurious ${material.toLowerCase()}, it's designed to move with you throughout the day.`,
    ],
    mens: [
      `Upgrade your everyday rotation with this ${color.toLowerCase()} ${title.toLowerCase()}. Premium ${material.toLowerCase()} construction ensures lasting comfort and durability.`,
      `Built for the modern man, this ${title.toLowerCase()} combines classic styling with contemporary fit. The ${material.toLowerCase()} fabric keeps you comfortable all day long.`,
      `Essential wardrobe piece — this ${color.toLowerCase()} ${title.toLowerCase()} offers exceptional quality at an accessible price point. ${material.toLowerCase()} blend for year-round wear.`,
    ],
    kids: [
      `Soft, durable and fun — this ${color.toLowerCase()} ${title.toLowerCase()} is made from gentle ${material.toLowerCase()} perfect for little ones. Machine washable for easy care.`,
      `Playtime-ready style for kids! This ${title.toLowerCase()} features super soft ${material.toLowerCase()} that's tough enough for everyday adventures.`,
    ],
    accessories: [
      `Add a touch of elegance to any outfit with this ${color.toLowerCase()} ${title.toLowerCase()}. Expertly crafted from premium ${material.toLowerCase()}, this accessory is both functional and fashionable.`,
      `A must-have staple — this ${title.toLowerCase()} brings together timeless design and quality ${material.toLowerCase()} craftsmanship.`,
    ],
    shoes: [
      `Step out in style with these ${color.toLowerCase()} ${title.toLowerCase()}. Designed with cushioned insoles and durable ${material.toLowerCase()} accents for all-day comfort.`,
      `Premium ${material.toLowerCase()} construction meets modern design in these ${title.toLowerCase()}. Lightweight and breathable for wherever your day takes you.`,
    ],
    sportswear: [
      `Performance meets style in this ${color.toLowerCase()} ${title.toLowerCase()}. Moisture-wicking ${material.toLowerCase()} keeps you cool and dry during your most intense workouts.`,
      `Engineered for movement — this ${title.toLowerCase()} features stretchy ${material.toLowerCase()} that moves with your body. Perfect for the gym or casual wear.`,
    ],
    luxury: [
      `Indulge in luxury with this exquisite ${color.toLowerCase()} ${title.toLowerCase()}. Handcrafted from the finest ${material.toLowerCase()}, each piece is a testament to exceptional artisanship.`,
      `A statement of refined taste — this ${title.toLowerCase()} showcases masterful ${material.toLowerCase()} craftsmanship with attention to every detail.`,
    ],
    bags: [
      `Carry your world in style with this ${color.toLowerCase()} ${title.toLowerCase()}. Premium ${material.toLowerCase()} construction with elegant hardware and spacious interior.`,
      `The perfect everyday bag — this ${title.toLowerCase()} combines sophisticated ${material.toLowerCase()} design with practical functionality.`,
    ],
    swimwear: [
      `Make a splash in this stunning ${color.toLowerCase()} ${title.toLowerCase()}. Quick-dry ${material.toLowerCase()} with UV protection for worry-free sun days.`,
      `Designed for the beach and pool, this ${title.toLowerCase()} features comfortable ${material.toLowerCase()} construction with vibrant ${color.toLowerCase()} coloring.`,
    ],
    lingerie: [
      `Feel gorgeous in this delicate ${color.toLowerCase()} ${title.toLowerCase()}. Made from ultra-soft ${material.toLowerCase()} with intricate detailing for ultimate comfort.`,
      `Luxurious intimates — this ${title.toLowerCase()} features feather-light ${material.toLowerCase()} construction that feels as good as it looks.`,
    ],
    "formal-wear": [
      `Make a powerful impression in this ${color.toLowerCase()} ${title.toLowerCase()}. Expertly tailored from premium ${material.toLowerCase()}, perfect for boardrooms and black-tie events alike.`,
      `Sophisticated formalwear crafted from the finest ${material.toLowerCase()}. This ${title.toLowerCase()} delivers a flawless silhouette for your most important occasions.`,
    ],
    outerwear: [
      `Stay warm without compromising style in this ${color.toLowerCase()} ${title.toLowerCase()}. Insulated ${material.toLowerCase()} construction provides warmth for chilly days.`,
      `Weather-ready and effortlessly cool — this ${title.toLowerCase()} features durable ${material.toLowerCase()} with a modern cut that transitions seamlessly from street to office.`,
    ],
  };
  const arr = descs[category] ?? descs["womens"];
  return pick(arr);
}

seedProducts()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
