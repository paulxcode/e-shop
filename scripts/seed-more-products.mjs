import pg from "pg"
import fs from "fs"

const pool = new pg.Pool({
  host: "db.lpqizrwfnkbonxsqffaw.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

const DIACS = { ă: "a", â: "a", î: "i", ș: "s", ț: "ț", Ă: "a", Â: "a", Î: "i", Ș: "s", Ț: "t" }
function slug(name) {
  let s = name.toLowerCase()
  for (const [k, v] of Object.entries(DIACS)) s = s.replaceAll(k, v)
  return s.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

function specs(o) {
  return JSON.stringify(o).replace(/'/g, "''")
}

function sql(products, catMap) {
  if (products.length === 0) return ""
  const rows = products.map(([name, desc, price, cp, catSlug, stock, feat, rating, sp]) => {
    const catId = catMap.get(catSlug)
    if (!catId) throw new Error(`Unknown category: ${catSlug}`)
    const prodSlug = `${slug(name)}-${Math.random().toString(36).slice(2, 6)}`
    const images = `ARRAY['https://placehold.co/600x400/DD700B/FCFBD8?text=${encodeURIComponent(name).replace(/'/g, "%27")}']`
    return `('${name.replace(/'/g, "''")}','${prodSlug}','${desc.replace(/'/g, "''")}',${price},${cp ?? "NULL"},${images},'${catId}',${stock},${feat},${rating},'${specs(sp)}'::jsonb)`
  })
  return `INSERT INTO products (name,slug,description,price,compare_price,images,category_id,stock,featured,rating,specifications) VALUES\n${rows.join(",\n")};\n`
}

const products = []

// Category 1: Laptop (20)
const lap = [
  ["Laptop Gaming MSI Katana 15", "Laptop gaming MSI Katana 15, Intel Core i7-13620H, 16GB DDR5, 1TB SSD, NVIDIA RTX 4070.", 5499.99, 6299.99, "laptop", 12, true, 4.5, { Brand: "MSI", Procesor: "Intel Core i7-13620H", RAM: "16GB DDR5", Stocare: "1TB SSD", "Placă video": "NVIDIA RTX 4070" }],
  ["Laptop Dell XPS 15", "Laptop premium Dell XPS 15, Intel Core i9, 32GB RAM, 1TB SSD, ecran OLED 3.5K.", 8999.99, 9999.99, "laptop", 8, true, 4.7, { Brand: "Dell", Procesor: "Intel Core i9", RAM: "32GB", Stocare: "1TB SSD", Ecran: '15.6" OLED' }],
  ["Laptop Apple MacBook Air M3", "MacBook Air M3, 15.3 inch, 8GB RAM, 256GB SSD, Midnight, MagSafe.", 6299.99, 6799.99, "laptop", 20, true, 4.8, { Brand: "Apple", Chip: "M3", RAM: "8GB", Stocare: "256GB SSD", Ecran: '15.3"' }],
  ["Laptop Acer Swift Go 14", "Laptop ultraportabil Acer Swift Go 14, OLED 2.8K, Intel Core Ultra 5, 16GB RAM.", 3499.99, 3999.99, "laptop", 15, true, 4.3, { Brand: "Acer", Procesor: "Intel Core Ultra 5", RAM: "16GB", Stocare: "512GB SSD", Ecran: '14" OLED' }],
  ["Laptop Lenovo ThinkPad X1 Carbon", "Laptop business Lenovo ThinkPad X1 Carbon Gen 11, Intel i7, 16GB RAM, 512GB SSD.", 7499.99, 8499.99, "laptop", 10, true, 4.6, { Brand: "Lenovo", Procesor: "Intel Core i7", RAM: "16GB", Stocare: "512GB SSD", Serie: "ThinkPad X1 Carbon" }],
  ["Laptop HP Spectre x360", "Laptop convertibil HP Spectre x360, Intel Core i7, 16GB RAM, 1TB SSD, ecran tactil 4K.", 6999.99, 7999.99, "laptop", 7, true, 4.4, { Brand: "HP", Procesor: "Intel Core i7", RAM: "16GB", Stocare: "1TB SSD", Tip: "Convertibil" }],
  ["Laptop Samsung Galaxy Book 3", "Laptop Samsung Galaxy Book 3, Intel Core i5, 8GB RAM, 256GB SSD, ecran AMOLED.", 3299.99, 3799.99, "laptop", 18, false, 4.2, { Brand: "Samsung", Procesor: "Intel Core i5", RAM: "8GB", Stocare: "256GB SSD", Ecran: "AMOLED" }],
  ["Laptop Gaming Lenovo Legion 5", "Laptop gaming Lenovo Legion 5, AMD Ryzen 7 7745HX, 16GB RAM, 512GB SSD, RTX 4060.", 4999.99, 5799.99, "laptop", 14, true, 4.5, { Brand: "Lenovo", Procesor: "AMD Ryzen 7", RAM: "16GB", Stocare: "512GB SSD", "Placă video": "RTX 4060" }],
  ["Laptop HP ProBook 450 G10", "Laptop business HP ProBook 450 G10, Intel Core i5, 16GB RAM, 512GB SSD.", 3799.99, 4299.99, "laptop", 22, false, 4.1, { Brand: "HP", Procesor: "Intel Core i5", RAM: "16GB", Stocare: "512GB SSD", Serie: "ProBook" }],
  ["Laptop Dell Inspiron 16", 'Laptop Dell Inspiron 16, Intel Core i5, 16GB RAM, 512GB SSD, ecran 16" FHD+.', 3299.99, 3699.99, "laptop", 25, false, 4.0, { Brand: "Dell", Procesor: "Intel Core i5", RAM: "16GB", Stocare: "512GB SSD", Ecran: '16" FHD+' }],
  ["Laptop ASUS ZenBook 14", "Laptop ASUS ZenBook 14, OLED 2.8K, Intel Core i7, 16GB RAM, 512GB SSD.", 4499.99, 4999.99, "laptop", 16, true, 4.4, { Brand: "ASUS", Procesor: "Intel Core i7", RAM: "16GB", Stocare: "512GB SSD", Ecran: '14" OLED' }],
  ["Laptop Acer Nitro 16", "Laptop gaming Acer Nitro 16, AMD Ryzen 5, 16GB RAM, 512GB SSD, RTX 3050.", 3899.99, 4499.99, "laptop", 19, true, 4.2, { Brand: "Acer", Procesor: "AMD Ryzen 5", RAM: "16GB", Stocare: "512GB SSD", "Placă video": "RTX 3050" }],
  ["Laptop Microsoft Surface Laptop 5", "Laptop Microsoft Surface Laptop 5, Intel Core i5, 8GB RAM, 256GB SSD, ecran tactil PixelSense.", 5499.99, 6199.99, "laptop", 9, true, 4.3, { Brand: "Microsoft", Procesor: "Intel Core i5", RAM: "8GB", Stocare: "256GB SSD", Ecran: "PixelSense" }],
  ["Laptop Huawei MateBook 14", "Laptop Huawei MateBook 14, Intel Core i5, 16GB RAM, 512GB SSD, ecran 2K tactil.", 3999.99, 4499.99, "laptop", 13, false, 4.1, { Brand: "Huawei", Procesor: "Intel Core i5", RAM: "16GB", Stocare: "512GB SSD" }],
  ["Laptop Gaming ASUS TUF A16", "Laptop gaming ASUS TUF A16, AMD Ryzen 7, 16GB RAM, 1TB SSD, Radeon RX 7700S.", 5199.99, 5899.99, "laptop", 11, true, 4.4, { Brand: "ASUS", Procesor: "AMD Ryzen 7", RAM: "16GB", Stocare: "1TB SSD", "Placă video": "Radeon RX 7700S" }],
  ["Laptop LG Gram 16", "Laptop ultraușor LG Gram 16, Intel Core i5, 16GB RAM, 512GB SSD, doar 1.18kg.", 4499.99, 4999.99, "laptop", 8, false, 4.3, { Brand: "LG", Procesor: "Intel Core i5", RAM: "16GB", Stocare: "512GB SSD", Greutate: "1.18kg" }],
  ["Laptop Dell Latitude 5540", "Laptop business Dell Latitude 5540, Intel Core i7, 32GB RAM, 512GB SSD.", 6299.99, 6999.99, "laptop", 17, true, 4.2, { Brand: "Dell", Procesor: "Intel Core i7", RAM: "32GB", Stocare: "512GB SSD", Serie: "Latitude" }],
  ["Laptop ASUS Vivobook 15", "Laptop ASUS Vivobook 15, Intel Core i3, 8GB RAM, 256GB SSD, ideal pentru birou.", 2199.99, 2599.99, "laptop", 30, false, 4.0, { Brand: "ASUS", Procesor: "Intel Core i3", RAM: "8GB", Stocare: "256GB SSD" }],
  ["Laptop Gaming Razer Blade 16", "Laptop gaming premium Razer Blade 16, Intel Core i9, 32GB RAM, 1TB SSD, RTX 4080.", 12999.99, 14999.99, "laptop", 5, true, 4.6, { Brand: "Razer", Procesor: "Intel Core i9", RAM: "32GB", Stocare: "1TB SSD", "Placă video": "RTX 4080" }],
  ["Laptop Lenovo IdeaPad Slim 3", 'Laptop Lenovo IdeaPad Slim 3, Intel N100, 8GB RAM, 256GB SSD, ecran 15.6".', 1599.99, 1899.99, "laptop", 28, false, 3.9, { Brand: "Lenovo", Procesor: "Intel N100", RAM: "8GB", Stocare: "256GB SSD" }],
]
products.push(...lap)

// Category 2: Tablete (20)
const tab = [
  ["Tabletă Apple iPad Pro M4", "iPad Pro M4 11 inch, 256GB, ecran Ultra Retina XDR, cameră 12MP.", 5999.99, 6799.99, "tablete", 15, true, 4.8, { Brand: "Apple", Ecran: '11" Ultra Retina XDR', Stocare: "256GB", Chip: "M4" }],
  ["Tabletă Samsung Galaxy Tab S9 FE", "Samsung Galaxy Tab S9 FE, 10.9\", 128GB, WiFi, S Pen inclus.", 1799.99, 2099.99, "tablete", 22, true, 4.3, { Brand: "Samsung", Ecran: '10.9"', Stocare: "128GB", "S Pen": "Inclus" }],
  ["Tabletă Lenovo Tab P12", "Lenovo Tab P12, 12.7\", 256GB, MediaTek Dimensity 7050, 4 difuzoare JBL.", 1999.99, 2399.99, "tablete", 18, true, 4.2, { Brand: "Lenovo", Ecran: '12.7"', Stocare: "256GB" }],
  ["Tabletă Xiaomi Pad 6", "Xiaomi Pad 6, 11\" 144Hz, 256GB, Snapdragon 870, 4 difuzoare Dolby Atmos.", 1799.99, 2199.99, "tablete", 24, true, 4.4, { Brand: "Xiaomi", Ecran: '11" 144Hz', Stocare: "256GB", Procesor: "Snapdragon 870" }],
  ["Tabletă Huawei MatePad 11.5", "Huawei MatePad 11.5, 8GB RAM, 256GB, HarmonyOS, ecran 2.2K.", 1699.99, 1999.99, "tablete", 12, false, 4.1, { Brand: "Huawei", Ecran: '11.5"', RAM: "8GB", Stocare: "256GB" }],
  ["Tabletă Lenovo Tab M10 Plus", "Lenovo Tab M10 Plus 3rd Gen, 10.6\", 128GB, ecran 2K.", 1199.99, 1399.99, "tablete", 20, false, 4.0, { Brand: "Lenovo", Ecran: '10.6"', Stocare: "128GB" }],
  ["Tabletă Samsung Galaxy Tab A9+", "Samsung Galaxy Tab A9+, 11\", 128GB, 4 difuzoare, multitasking.", 1299.99, 1499.99, "tablete", 30, false, 4.2, { Brand: "Samsung", Ecran: '11"', Stocare: "128GB" }],
  ["Tabletă Apple iPad Mini 6", "iPad Mini 6, 8.3\", 64GB, chip A15 Bionic, USB-C, Apple Pencil 2.", 2799.99, 3199.99, "tablete", 16, true, 4.6, { Brand: "Apple", Ecran: '8.3"', Stocare: "64GB", Chip: "A15 Bionic" }],
  ["Tabletă Amazon Fire HD 10", "Amazon Fire HD 10, 10.1\", 32GB, Full HD, Alexa, baterie 12h.", 699.99, 899.99, "tablete", 25, false, 4.0, { Brand: "Amazon", Ecran: '10.1"', Stocare: "32GB" }],
  ["Tabletă Huawei MatePad Pro 13.2", "Huawei MatePad Pro 13.2, OLED, 16GB RAM, 1TB, stylus M-Pencil.", 4999.99, 5799.99, "tablete", 7, true, 4.5, { Brand: "Huawei", Ecran: '13.2" OLED', RAM: "16GB", Stocare: "1TB" }],
  ["Tabletă Xiaomi Redmi Pad SE", "Xiaomi Redmi Pad SE, 11\", 128GB, Snapdragon 680, 8000mAh.", 999.99, 1199.99, "tablete", 28, false, 4.1, { Brand: "Xiaomi", Ecran: '11"', Stocare: "128GB" }],
  ["Tabletă Samsung Galaxy Tab S9 Ultra", "Samsung Galaxy Tab S9 Ultra, 14.6\", 512GB, Dynamic AMOLED 2X, S Pen.", 6999.99, 7999.99, "tablete", 9, true, 4.7, { Brand: "Samsung", Ecran: '14.6"', Stocare: "512GB", "S Pen": "Inclus" }],
  ["Tabletă Apple iPad 10th Gen", "iPad 10th Gen, 10.9\", 64GB, chip A14 Bionic, USB-C, cameră 12MP.", 2199.99, 2499.99, "tablete", 26, true, 4.4, { Brand: "Apple", Ecran: '10.9"', Stocare: "64GB", Chip: "A14 Bionic" }],
  ["Tabletă Lenovo Tab M9", "Lenovo Tab M9, 9\", 64GB, MediaTek Helio G80, Android 12.", 699.99, 849.99, "tablete", 22, false, 3.9, { Brand: "Lenovo", Ecran: '9"', Stocare: "64GB" }],
  ["Tabletă Blackview Tab 18", "Blackview Tab 18, 12\", 256GB, 16GB RAM, 4 difuzoare stereo, LTE.", 1399.99, 1699.99, "tablete", 14, false, 4.1, { Brand: "Blackview", Ecran: '12"', RAM: "16GB", Stocare: "256GB" }],
  ["Tabletă TCL Tab 11", "TCL Tab 11, 11.5\", 256GB, ecran NXTVISION 2K, 4 difuzoare.", 1099.99, 1299.99, "tablete", 17, false, 4.0, { Brand: "TCL", Ecran: '11.5"', Stocare: "256GB" }],
  ["Tabletă Nokia T21", "Nokia T21, 10.4\", 64GB, 4GB RAM, baterie 8200mAh, Android 12.", 899.99, 999.99, "tablete", 23, false, 3.9, { Brand: "Nokia", Ecran: '10.4"', RAM: "4GB", Stocare: "64GB" }],
  ["Tabletă Realme Pad 2", "Realme Pad 2, 11.5\", 256GB, MediaTek Helio G99, 4 difuzoare, 8360mAh.", 1199.99, 1399.99, "tablete", 19, false, 4.1, { Brand: "Realme", Ecran: '11.5"', Stocare: "256GB" }],
  ["Tabletă Onyx Boox Note Air 3", "Onyx Boox Note Air 3, 10.3\" E-Ink, 64GB, stylus inclus, Wi-Fi.", 3499.99, 3999.99, "tablete", 6, true, 4.3, { Brand: "Onyx", Ecran: '10.3" E-Ink', Stocare: "64GB", Stylus: "Inclus" }],
  ["E-Reader Kobo Libra 2", "Kobo Libra 2, 7\" E-Ink, 32GB, rezistent la apă, lumină caldă.", 849.99, 999.99, "tablete", 18, false, 4.4, { Brand: "Kobo", Ecran: '7" E-Ink', Stocare: "32GB", "Rezistent apă": "Da" }],
]
products.push(...tab)

// Category 3: Telefoane (20)
const tel = [
  ["Telefon Apple iPhone 16 Pro Max", "iPhone 16 Pro Max, 256GB, chip A18 Pro, cameră 48MP, titan, USB-C.", 8499.99, 8999.99, "telefoane", 10, true, 4.9, { Brand: "Apple", Model: "iPhone 16 Pro Max", Stocare: "256GB", Chip: "A18 Pro" }],
  ["Telefon Samsung Galaxy S25 Ultra", "Galaxy S25 Ultra, 512GB, Dynamic AMOLED 6.9\", S Pen, cameră 200MP.", 7999.99, 8799.99, "telefoane", 8, true, 4.8, { Brand: "Samsung", Model: "Galaxy S25 Ultra", Stocare: "512GB", "Cameră": "200MP" }],
  ["Telefon Google Pixel 9 Pro", "Pixel 9 Pro, 256GB, Tensor G4, cameră 64MP, AI Gemini, 7 ani update-uri.", 5299.99, 5799.99, "telefoane", 14, true, 4.7, { Brand: "Google", Stocare: "256GB", Chip: "Tensor G4", "Cameră": "64MP" }],
  ["Telefon Xiaomi 15 Pro", "Xiaomi 15 Pro, 512GB, Snapdragon 8 Gen 4, cameră Leica 50MP, 120W.", 4499.99, 4999.99, "telefoane", 18, true, 4.5, { Brand: "Xiaomi", Stocare: "512GB", Procesor: "Snapdragon 8 Gen 4", "Cameră": "Leica 50MP" }],
  ["Telefon OnePlus 13", "OnePlus 13, 512GB, Snapdragon 8 Gen 4, AMOLED 6.82\", 100W SUPERVOOC.", 4299.99, 4799.99, "telefoane", 20, true, 4.6, { Brand: "OnePlus", Stocare: "512GB", Procesor: "Snapdragon 8 Gen 4", "Încărcare": "100W" }],
  ["Telefon Samsung Galaxy A55", "Galaxy A55, 256GB, Exynos 1480, cameră 50MP OIS, Super AMOLED 120Hz.", 1999.99, 2299.99, "telefoane", 32, true, 4.3, { Brand: "Samsung", Model: "Galaxy A55", Stocare: "256GB", "Cameră OIS": "50MP" }],
  ["Telefon Xiaomi Redmi Note 14 Pro", "Redmi Note 14 Pro+, 512GB, Dimensity 7200, cameră 200MP, 120W.", 1999.99, 2399.99, "telefoane", 25, true, 4.3, { Brand: "Xiaomi", Stocare: "512GB", "Cameră": "200MP" }],
  ["Telefon Motorola Edge 50 Pro", "Motorola Edge 50 Pro, 512GB, Snapdragon 7 Gen 3, cameră 50MP, 125W.", 2999.99, 3499.99, "telefoane", 16, true, 4.3, { Brand: "Motorola", Stocare: "512GB", "Cameră": "50MP", "Încărcare": "125W" }],
  ["Telefon Sony Xperia 1 VI", "Xperia 1 VI, 256GB, Snapdragon 8 Gen 4, 4K OLED, cameră 48MP zoom optic.", 6999.99, 7799.99, "telefoane", 7, true, 4.5, { Brand: "Sony", Stocare: "256GB", Ecran: "4K OLED", "Cameră": "48MP" }],
  ["Telefon Huawei P70 Pro", "Huawei P70 Pro, 512GB, Kirin 9010, XMAGE 50MP, HarmonyOS, SOS.", 4999.99, 5699.99, "telefoane", 11, true, 4.4, { Brand: "Huawei", Stocare: "512GB", "Cameră": "XMAGE 50MP" }],
  ["Telefon Nothing Phone 3", "Nothing Phone 3, 256GB, Snapdragon 8s Gen 3, Glyph Interface, 50MP dual.", 3799.99, 4299.99, "telefoane", 19, true, 4.4, { Brand: "Nothing", Stocare: "256GB", Procesor: "Snapdragon 8s Gen 3" }],
  ["Telefon Honor Magic 6 Pro", "Honor Magic 6 Pro, 512GB, Snapdragon 8 Gen 4, cameră 180MP periscop.", 5499.99, 6199.99, "telefoane", 13, true, 4.5, { Brand: "Honor", Stocare: "512GB", "Cameră periscop": "180MP" }],
  ["Telefon Realme GT 6", "Realme GT 6, 256GB, Snapdragon 8s Gen 3, 144Hz, cameră 50MP, 120W.", 2999.99, 3499.99, "telefoane", 21, false, 4.3, { Brand: "Realme", Stocare: "256GB", Procesor: "Snapdragon 8s Gen 3" }],
  ["Telefon Oppo Find X7 Ultra", "Oppo Find X7 Ultra, 512GB, Snapdragon 8 Gen 4, Hasselblad 50MP, 100W.", 6499.99, 7299.99, "telefoane", 6, true, 4.6, { Brand: "Oppo", Stocare: "512GB", "Cameră": "Hasselblad 50MP" }],
  ["Telefon Samsung Galaxy A25", "Galaxy A25, 128GB, Exynos 1280, Super AMOLED 6.5\", cameră 50MP, 5000mAh.", 1199.99, 1399.99, "telefoane", 35, false, 4.1, { Brand: "Samsung", Model: "Galaxy A25", Stocare: "128GB" }],
  ["Telefon Apple iPhone 16", "iPhone 16, 128GB, chip A18, cameră 48MP, USB-C, Action Button.", 4999.99, 5499.99, "telefoane", 24, true, 4.7, { Brand: "Apple", Model: "iPhone 16", Stocare: "128GB", Chip: "A18" }],
  ["Telefon Xiaomi Redmi Note 14", "Redmi Note 14, 256GB, MediaTek Dimensity 7025, cameră 108MP, 5500mAh.", 1399.99, 1599.99, "telefoane", 30, false, 4.2, { Brand: "Xiaomi", Stocare: "256GB", Baterie: "5500mAh" }],
  ["Telefon Samsung Galaxy M55", "Galaxy M55, 256GB, Snapdragon 7 Gen 1, Super AMOLED 120Hz, 6000mAh.", 1799.99, 2099.99, "telefoane", 27, false, 4.2, { Brand: "Samsung", Model: "Galaxy M55", Stocare: "256GB", Baterie: "6000mAh" }],
  ["Telefon Honor 200 Pro", "Honor 200 Pro, 512GB, Snapdragon 8 Gen 3, portret Studio Harcourt, 100W.", 3999.99, 4599.99, "telefoane", 15, true, 4.4, { Brand: "Honor", Stocare: "512GB", "Cameră": "Studio Harcourt" }],
  ["Telefon Google Pixel 8a", "Pixel 8a, 128GB, Tensor G3, 64MP, 6.1\" OLED 120Hz, 7 ani update-uri.", 2799.99, 3199.99, "telefoane", 28, true, 4.5, { Brand: "Google", Stocare: "128GB", Chip: "Tensor G3" }],
]
products.push(...tel)

// Category 4: PC-uri (20)
const pc = [
  ["PC Gaming Ryzen 7 RTX 4070 Super", "AMD Ryzen 7 7800X3D, 32GB DDR5, 1TB SSD, RTX 4070 Super 12GB.", 8499.99, 9499.99, "pc-uri", 7, true, 4.7, { Procesor: "AMD Ryzen 7 7800X3D", RAM: "32GB DDR5", "Placă video": "RTX 4070 Super", Stocare: "1TB SSD" }],
  ["PC Gaming Intel i9 RTX 4080", "Intel Core i9-14900K, 64GB DDR5, 2TB SSD, RTX 4080 Super 16GB.", 13999.99, 15999.99, "pc-uri", 4, true, 4.8, { Procesor: "Intel Core i9-14900K", RAM: "64GB DDR5", "Placă video": "RTX 4080 Super", Stocare: "2TB SSD" }],
  ["PC Birou Intel i5 16GB", "Intel Core i5-13400, 16GB DDR4, 512GB SSD, monitor 24\" inclus.", 3499.99, 3999.99, "pc-uri", 18, true, 4.2, { Procesor: "Intel Core i5-13400", RAM: "16GB DDR4", Stocare: "512GB SSD" }],
  ["PC Workstation AMD Ryzen 9", "AMD Ryzen 9 7950X, 64GB DDR5, 1TB SSD, RTX 4060, 850W.", 9999.99, 11499.99, "pc-uri", 6, true, 4.5, { Procesor: "AMD Ryzen 9 7950X", RAM: "64GB DDR5", "Placă video": "RTX 4060", Stocare: "1TB SSD" }],
  ["PC Gaming Budget Intel i3", "Intel Core i3-14100F, 16GB DDR4, 512GB SSD, GTX 1650.", 2999.99, 3499.99, "pc-uri", 22, true, 4.0, { Procesor: "Intel Core i3-14100F", RAM: "16GB DDR4", "Placă video": "GTX 1650", Stocare: "512GB SSD" }],
  ["PC All-in-One Apple iMac M3", "Apple iMac 24\" M3, 8GB RAM, 256GB SSD, 4.5K, Magic Mouse + Keyboard.", 8999.99, 9999.99, "pc-uri", 10, true, 4.6, { Brand: "Apple", Ecran: '24" 4.5K', Chip: "M3", RAM: "8GB" }],
  ["PC Mini Intel NUC 13", "Intel NUC 13, Core i7, 32GB RAM, 1TB SSD, Wi-Fi 6E, Thunderbolt 4.", 4999.99, 5699.99, "pc-uri", 14, true, 4.3, { Brand: "Intel", Procesor: "Core i7", RAM: "32GB", Stocare: "1TB SSD" }],
  ["PC Gaming AMD Ryzen 5 RTX 4060", "AMD Ryzen 5 7600, 16GB DDR5, 1TB SSD, RTX 4060 8GB.", 5499.99, 6299.99, "pc-uri", 12, true, 4.4, { Procesor: "AMD Ryzen 5 7600", RAM: "16GB DDR5", "Placă video": "RTX 4060", Stocare: "1TB SSD" }],
  ["PC Birou Intel i7 32GB", "Intel Core i7-14700, 32GB DDR4, 1TB SSD, Windows 11 Pro.", 5499.99, 6199.99, "pc-uri", 16, false, 4.3, { Procesor: "Intel Core i7-14700", RAM: "32GB DDR4", Stocare: "1TB SSD" }],
  ["PC Gaming Intel i5 RTX 4070", "Intel Core i5-14600KF, 32GB DDR5, 1TB SSD, RTX 4070 12GB.", 6999.99, 7999.99, "pc-uri", 9, true, 4.5, { Procesor: "Intel Core i5-14600KF", RAM: "32GB DDR5", "Placă video": "RTX 4070", Stocare: "1TB SSD" }],
  ["PC Gaming AMD Ryzen 9 RTX 4090", "AMD Ryzen 9 7950X3D, 64GB DDR5, 2TB SSD, RTX 4090 24GB.", 21999.99, 24999.99, "pc-uri", 3, true, 4.9, { Procesor: "AMD Ryzen 9 7950X3D", RAM: "64GB DDR5", "Placă video": "RTX 4090", Stocare: "2TB SSD" }],
  ["PC Mini Apple Mac Mini M4", "Apple Mac Mini M4, 16GB RAM, 256GB SSD, HDMI, USB-C/Thunderbolt 4.", 3999.99, 4499.99, "pc-uri", 20, true, 4.5, { Brand: "Apple", Chip: "M4", RAM: "16GB", Stocare: "256GB SSD" }],
  ["PC Workstation Intel Xeon", "Intel Xeon W-2255, 64GB ECC, 1TB NVMe, Quadro RTX 4000.", 12999.99, 14999.99, "pc-uri", 5, true, 4.4, { Procesor: "Intel Xeon W-2255", RAM: "64GB ECC", Stocare: "1TB NVMe", "Placă video": "Quadro RTX 4000" }],
  ["PC All-in-One HP Envy 32", "HP Envy 32, 4K, Intel Core i7, 16GB RAM, 1TB SSD, RTX 3050.", 7999.99, 8999.99, "pc-uri", 8, true, 4.2, { Brand: "HP", Ecran: '32" 4K', Procesor: "Intel Core i7", RAM: "16GB" }],
  ["PC Gaming Intel i9 RTX 4070 Ti", "Intel Core i9-13900KF, 32GB DDR5, 1TB SSD, RTX 4070 Ti 12GB.", 8999.99, 10499.99, "pc-uri", 6, true, 4.6, { Procesor: "Intel Core i9-13900KF", RAM: "32GB DDR5", "Placă video": "RTX 4070 Ti", Stocare: "1TB SSD" }],
  ["PC Birou AMD Ryzen 3", "AMD Ryzen 3 4100, 8GB DDR4, 256GB SSD, monitor 21.5\" inclus.", 2299.99, 2699.99, "pc-uri", 24, false, 3.9, { Procesor: "AMD Ryzen 3 4100", RAM: "8GB DDR4", Stocare: "256GB SSD" }],
  ["PC Silent Home Server", "Intel N100, 16GB RAM, 4x HDD bay, 250W PSU, NAS-ready.", 2499.99, 2999.99, "pc-uri", 11, false, 4.1, { Procesor: "Intel N100", RAM: "16GB", "HDD bays": "4" }],
  ["PC Gaming RGB Ryzen 5 RX 7600", "AMD Ryzen 5 7500F, 16GB DDR5, 512GB SSD, Radeon RX 7600 8GB.", 4499.99, 5199.99, "pc-uri", 15, true, 4.3, { Procesor: "AMD Ryzen 5 7500F", RAM: "16GB DDR5", "Placă video": "RX 7600" }],
  ["PC All-in-One Lenovo IdeaCentre", "Lenovo IdeaCentre AIO 24\", Intel Core i5, 16GB RAM, 512GB SSD, FHD.", 4499.99, 4999.99, "pc-uri", 13, false, 4.1, { Brand: "Lenovo", Ecran: '24" FHD', Procesor: "Intel Core i5", RAM: "16GB" }],
  ["PC Gaming Intel i7 RTX 4060 Ti", "Intel Core i7-13700F, 32GB DDR4, 1TB SSD, RTX 4060 Ti 8GB.", 6499.99, 7499.99, "pc-uri", 10, true, 4.4, { Procesor: "Intel Core i7-13700F", RAM: "32GB DDR4", "Placă video": "RTX 4060 Ti", Stocare: "1TB SSD" }],
]
products.push(...pc)

// Category 5: Periferice (20)
const per = [
  ["Monitor Gaming MSI 27\" 240Hz", "MSI 27\" Rapid IPS, 240Hz, 1ms, HDR400, G-Sync, 2560x1440.", 2499.99, 2899.99, "periferice", 14, true, 4.6, { Brand: "MSI", Diagonala: '27"', Refresh: "240Hz", Panou: "Rapid IPS" }],
  ['Monitor 49" Samsung Odyssey G9', '49" curbat DQHD 5120x1440, 240Hz, 1ms, OLED, G-Sync, HDR10+.', 7499.99, 8499.99, "periferice", 5, true, 4.7, { Brand: "Samsung", Diagonala: '49"', Refresh: "240Hz", Panou: "OLED" }],
  ["Tastatură mecanică Corsair K70", "Corsair K70 RGB, Cherry MX Red, aluminiu, RGB.", 799.99, 949.99, "periferice", 18, true, 4.5, { Brand: "Corsair", Switch: "Cherry MX Red", RGB: "Da" }],
  ["Mouse Logitech G502 X Plus", "Logitech G502 X Plus, HERO 25K, RGB, wireless, 8 butoane.", 599.99, 699.99, "periferice", 23, true, 4.6, { Brand: "Logitech", Senzor: "HERO 25K", Conexiune: "Wireless", Butoane: "8" }],
  ["Căști gaming SteelSeries Arctis Pro", "SteelSeries Arctis Pro + GameDAC, Hi-Res Audio, DTS 7.1.", 999.99, 1199.99, "periferice", 16, true, 4.5, { Brand: "SteelSeries", Sunet: "Hi-Res + DTS 7.1" }],
  ['Monitor 27" 4K LG Ultrafine', 'LG 27" 4K UHD, IPS, USB-C 96W, HDR400, boxe integrate.', 2999.99, 3499.99, "periferice", 11, true, 4.4, { Brand: "LG", Diagonala: '27"', Rezolutie: "4K UHD", Panou: "IPS" }],
  ["Set boxe 2.0 Edifier R1280T", "Edifier R1280T, 42W RMS, lemn MDF, AUX, RCA.", 399.99, 469.99, "periferice", 25, false, 4.4, { Brand: "Edifier", Putere: "42W RMS" }],
  ["Tastatură gaming ASUS ROG Azoth", "ASUS ROG Azoth, NX Red, OLED, tri-mode, 75%.", 1299.99, 1499.99, "periferice", 9, true, 4.5, { Brand: "ASUS", Switch: "NX Red", RGB: "Da", Conexiune: "Tri-mode" }],
  ["Mouse gaming Razer Viper V3 Pro", "Razer Viper V3 Pro, Focus Pro 35K, 55g, HyperSpeed, 90h.", 599.99, 699.99, "periferice", 20, true, 4.7, { Brand: "Razer", Senzor: "Focus Pro 35K", Greutate: "55g", Autonomie: "90h" }],
  ["Căști Logitech G733", "Logitech G733, DTS:X 7.1, RGB, microfon detașabil, 29h.", 649.99, 749.99, "periferice", 22, false, 4.3, { Brand: "Logitech", Sunet: "DTS:X 7.1", Autonomie: "29h" }],
  ['Monitor 34" curbat Dell', 'Dell 34" curbat, WQHD 3440x1440, IPS, 120Hz, USB-C hub.', 3999.99, 4599.99, "periferice", 8, true, 4.4, { Brand: "Dell", Diagonala: '34"', Rezolutie: "WQHD", Refresh: "120Hz" }],
  ['Tabletă grafică XP-Pen Artist 12', "XP-Pen Artist 12, 11.9\", stylus 8192 niveluri, fără baterie.", 999.99, 1199.99, "periferice", 14, false, 4.3, { Brand: "XP-Pen", Suprafață: '11.9"', "Niveluri presiune": "8192" }],
  ["Cameră web Logitech Brio 4K", "Logitech Brio 4K Ultra HD, HDR, autofocus, 90°.", 549.99, 649.99, "periferice", 17, false, 4.4, { Brand: "Logitech", Rezoluție: "4K", HDR: "Da", Autofocus: "Da" }],
  ["Scaun birou ergonomic Markus", "Scaun birou plasă, suport lombar, brațe reglabile, negru.", 1299.99, 1499.99, "periferice", 19, true, 4.3, { Material: "Plasă", "Suport lombar": "Da" }],
  ["Microfon gaming HyperX QuadCast", "HyperX QuadCast, USB, cardioid, pop filter, anti-șoc, RGB.", 349.99, 399.99, "periferice", 24, false, 4.5, { Brand: "HyperX", Conexiune: "USB", Polar: "Cardioid" }],
  ["Stație andocare CalDigit TS4", "CalDigit TS4, 18 porturi, Thunderbolt 4, 98W PD, 10Gbps.", 1999.99, 2299.99, "periferice", 7, true, 4.6, { Brand: "CalDigit", Porturi: "18", Thunderbolt: "4", PD: "98W" }],
  ["Mousepad gaming Logitech G840", "Logitech G840 XL, 900x400x3mm, textil, cauciuc antialunecare.", 249.99, 299.99, "periferice", 28, false, 4.3, { Brand: "Logitech", Dimensiuni: "900x400mm" }],
  ["Hub USB-C 11 în 1", "Hub USB-C 11 porturi, HDMI 4K 60Hz, Ethernet, SD, PD 100W.", 199.99, 249.99, "periferice", 30, false, 4.2, { Porturi: "11", "HDMI 4K": "60Hz", PD: "100W" }],
  ["Căști wireless Sony INZONE H9", "Sony INZONE H9, noise canceling, 360 Spatial Sound, 32h.", 999.99, 1199.99, "periferice", 13, true, 4.4, { Brand: "Sony", "Noise canceling": "Da", Sunet: "360 Spatial Sound", Autonomie: "32h" }],
  ["Sursă Corsair RM850x", "Corsair RM850x, 850W, 80+ Gold, modulară, 135mm, zero RPM.", 699.99, 799.99, "periferice", 15, false, 4.5, { Brand: "Corsair", Putere: "850W", Certificare: "80+ Gold", Modular: "Da" }],
]
products.push(...per)

// Category 6: Software (20)
const soft = [
  ["Microsoft Office 2024 Professional", "Office 2024 Professional, Word, Excel, PowerPoint, Outlook, 1 PC.", 899.99, 1099.99, "software", 25, true, 4.2, { Produs: "Office 2024 Professional", Aplicații: "Word, Excel, PPT, Outlook", Dispozitive: "1 PC" }],
  ["Windows 11 Pro", "Windows 11 Pro, 64-bit, limba română, actualizări incluse.", 1299.99, 1499.99, "software", 30, true, 4.3, { Produs: "Windows 11 Pro", Arhitectură: "64-bit" }],
  ["Antivirus Kaspersky Premium 2025", "Kaspersky Premium, 5 dispozitive, VPN, control parental, manager parole.", 299.99, 399.99, "software", 30, false, 4.4, { Brand: "Kaspersky", Dispozitive: "5", VPN: "Da" }],
  ["Adobe Creative Cloud 1 an", "CC 1 an, Photoshop, Premiere Pro, AE, Lightroom.", 2499.99, 2999.99, "software", 15, true, 4.5, { Produs: "Creative Cloud", Aplicații: "Photoshop, Premiere, AE", Durată: "1 an" }],
  ["Microsoft Visual Studio 2024", "Visual Studio 2024 Professional, Windows, licență perpetuu, 1 an suport.", 3499.99, 4199.99, "software", 10, true, 4.3, { Produs: "Visual Studio 2024", Ediție: "Professional", Suport: "1 an" }],
  ["Norton 360 Deluxe 2025", "Norton 360 Deluxe, 5 dispozitive, VPN, dark web, cloud 50GB.", 249.99, 349.99, "software", 30, false, 4.2, { Brand: "Norton", Dispozitive: "5", VPN: "Da", Cloud: "50GB" }],
  ["CorelDRAW Graphics Suite 2024", "CorelDRAW 2024, design vectorial, layout, editare foto, 1 an.", 1999.99, 2399.99, "software", 12, true, 4.2, { Produs: "CorelDRAW 2024", Tip: "Design grafic", Durată: "1 an" }],
  ["McAfee Total Protection 2025", "McAfee Total Protection, nelimitat dispozitive, VPN, manager parole.", 199.99, 279.99, "software", 30, false, 4.1, { Brand: "McAfee", Dispozitive: "Nelimitat", VPN: "Da" }],
  ["AutoCAD 2025 Licență", "AutoCAD 2025, 1 an, design 2D/3D, AI-assisted, cloud, suport.", 7499.99, 8999.99, "software", 8, true, 4.4, { Produs: "AutoCAD 2025", Tip: "CAD", Durată: "1 an" }],
  ["MATLAB & Simulink Student", "MATLAB & Simulink Student Suite, 1 an, acces complet.", 499.99, 599.99, "software", 14, false, 4.5, { Produs: "MATLAB + Simulink", Tip: "Student", Durată: "1 an" }],
  ["VMware Workstation Pro 17", "VMware Workstation 17 Pro, perpetuu, virtualizare, Win/Linux.", 1599.99, 1899.99, "software", 18, true, 4.3, { Produs: "VMware Workstation 17 Pro" }],
  ["JetBrains IntelliJ IDEA Ultimate", "IntelliJ IDEA Ultimate, 1 an, Java, Kotlin, Spring, AI.", 1999.99, 2399.99, "software", 10, true, 4.6, { Produs: "IntelliJ IDEA Ultimate", Limbaje: "Java, Kotlin", Durată: "1 an" }],
  ["Bitdefender Family Pack 2025", "Bitdefender Family Pack, 15 dispozitive, VPN, parental, anti-furt.", 399.99, 499.99, "software", 30, true, 4.3, { Brand: "Bitdefender", Dispozitive: "15", VPN: "Da" }],
  ["SolidWorks Standard 2024", "SolidWorks Standard 2024, CAD 3D, simulare, desen tehnic, 1 an.", 8999.99, 10999.99, "software", 5, true, 4.4, { Produs: "SolidWorks", Ediție: "Standard 2024", Durată: "1 an" }],
  ["Microsoft Project Professional", "Microsoft Project Professional 2024, Gantt, resurse.", 2399.99, 2799.99, "software", 10, false, 4.1, { Produs: "Project 2024", Ediție: "Professional" }],
  ["Adobe Photoshop + Lightroom", "Photoshop + Lightroom, 1 an, editare foto, AI, cloud 1TB.", 999.99, 1199.99, "software", 18, true, 4.5, { Produs: "Photoshop + Lightroom", Cloud: "1TB", Durată: "1 an" }],
  ["Norton 360 Premium 2025", "Norton 360 Premium, 10 dispozitive, VPN, cloud 100GB, dark web.", 349.99, 429.99, "software", 30, false, 4.2, { Brand: "Norton", Dispozitive: "10", VPN: "Da", Cloud: "100GB" }],
  ["WinRAR 6.x Licență", "WinRAR 6.x, perpetuu, arhivare RAR/ZIP, criptare AES-256.", 49.99, null, "software", 30, false, 4.0, { Produs: "WinRAR 6.x", Criptare: "AES-256" }],
  ["Parallels Desktop 19", "Parallels Desktop 19 pentru Mac, virtualizare, Apple Silicon.", 1499.99, 1799.99, "software", 12, true, 4.4, { Produs: "Parallels Desktop 19", Platformă: "Mac", "Suport Apple Silicon": "Da" }],
  ["ESET Internet Security 2025", "ESET Internet Security, 3 dispozitive, anti-phishing, firewall.", 179.99, 229.99, "software", 30, false, 4.3, { Brand: "ESET", Dispozitive: "3", "Protecție banking": "Da" }],
]
products.push(...soft)

// Category 7: TV (20)
const tv = [
  ['Televizor Samsung 75" 4K QLED', 'Samsung 75" QLED 4K, HDR10+, 120Hz, Tizen, SmartThings, Ambient Mode+.', 5499.99, 6499.99, "tv", 10, true, 4.6, { Brand: "Samsung", Diagonala: '75"', Rezoluție: "4K QLED", Smart: "Tizen" }],
  ['Televizor LG 77" OLED evo', 'LG 77" OLED evo, 4K, Dolby Vision IQ, Dolby Atmos, α9 Gen6, webOS.', 11999.99, 13999.99, "tv", 5, true, 4.8, { Brand: "LG", Diagonala: '77"', Tehnologie: "OLED evo" }],
  ['Televizor Sony 85" X90L', 'Sony 85" Full Array LED, 4K HDR XR, 120Hz, Dolby Atmos, Google TV.', 8999.99, 10499.99, "tv", 7, true, 4.5, { Brand: "Sony", Diagonala: '85"', Smart: "Google TV" }],
  ['Televizor Samsung 55" Neo QLED 8K', 'Samsung 55" Neo QLED 8K, Neuron Quantum 8K, 120Hz, Dolby Atmos.', 6999.99, 7999.99, "tv", 9, true, 4.4, { Brand: "Samsung", Diagonala: '55"', Rezoluție: "8K", Tehnologie: "Neo QLED" }],
  ['Televizor Philips 65" OLED+', 'Philips 65" OLED+, 4K, Ambilight 3-sided, P5 AI, Dolby Atmos.', 6999.99, 7999.99, "tv", 8, true, 4.5, { Brand: "Philips", Diagonala: '65"', Tehnologie: "OLED+", Ambilight: "3-sided" }],
  ['Televizor Samsung 43" Crystal UHD', 'Samsung 43" Crystal UHD 4K, HDR10+, PurColor, Tizen, AirSlim.', 2199.99, 2599.99, "tv", 20, true, 4.2, { Brand: "Samsung", Diagonala: '43"', Rezoluție: "4K UHD" }],
  ['Televizor LG 55" NanoCell', 'LG 55" NanoCell 4K, 120Hz, Dolby Vision, Game Optimizer, webOS 24.', 3499.99, 3999.99, "tv", 15, true, 4.3, { Brand: "LG", Diagonala: '55"', Tehnologie: "NanoCell", Refresh: "120Hz" }],
  ['Televizor Sony 65" A95L QD-OLED', 'Sony 65" QD-OLED, XR Cognitive, Dolby Vision, Acoustic Surface+.', 10999.99, 12999.99, "tv", 4, true, 4.7, { Brand: "Sony", Diagonala: '65"', Tehnologie: "QD-OLED" }],
  ['Televizor TCL 75" Mini-LED', 'TCL 75" Mini-LED 4K, 120Hz, HDR10+, Dolby Vision, Google TV.', 4999.99, 5799.99, "tv", 11, true, 4.3, { Brand: "TCL", Diagonala: '75"', Tehnologie: "Mini-LED" }],
  ['Televizor Hisense 65" U8K', 'Hisense 65" Mini-LED 4K, 144Hz, Dolby Vision IQ, HDR10+, VIDAA.', 3999.99, 4799.99, "tv", 13, false, 4.3, { Brand: "Hisense", Diagonala: '65"', Refresh: "144Hz" }],
  ['Televizor Samsung 32" LED', 'Samsung 32" HD Ready LED, 2x HDMI, USB, Tizen.', 1099.99, 1299.99, "tv", 25, false, 4.0, { Brand: "Samsung", Diagonala: '32"', Rezoluție: "HD Ready" }],
  ['Televizor LG 50" UR80', 'LG 50" 4K UHD, HDR10, webOS 24, AI ThinQ, Magic Remote.', 2499.99, 2899.99, "tv", 18, false, 4.1, { Brand: "LG", Diagonala: '50"', Rezoluție: "4K UHD" }],
  ['Televizor Panasonic 55" OLED', 'Panasonic 55" OLED 4K, HCX Pro AI, Dolby Vision, HDR10+, Filmmaker Mode.', 6499.99, 7499.99, "tv", 6, true, 4.5, { Brand: "Panasonic", Diagonala: '55"', Tehnologie: "OLED" }],
  ['Televizor Samsung 85" Neo QLED', 'Samsung 85" Neo QLED 4K, 120Hz, Object Tracking Sound+, Solar Remote.', 12999.99, 14999.99, "tv", 4, true, 4.6, { Brand: "Samsung", Diagonala: '85"', Tehnologie: "Neo QLED" }],
  ['Televizor Philips 43" PUS', 'Philips 43" 4K UHD, Ambilight, HDR10+, Pixel Precise, Google TV.', 2199.99, 2599.99, "tv", 16, false, 4.1, { Brand: "Philips", Diagonala: '43"', Rezoluție: "4K UHD", Ambilight: "Da" }],
  ['Televizor LG 86" UR91', 'LG 86" 4K UHD, HDR10, webOS 24, AI Sound, Magic Remote, 2.2 canale.', 6999.99, 7999.99, "tv", 7, true, 4.3, { Brand: "LG", Diagonala: '86"', Rezoluție: "4K UHD" }],
  ['Televizor Sony 55" X80L', 'Sony 55" 4K LED, X1 Processor, HDR, Dolby Vision, Google TV.', 3299.99, 3799.99, "tv", 14, false, 4.1, { Brand: "Sony", Diagonala: '55"', Smart: "Google TV" }],
  ['Televizor Samsung 65" Frame', 'Samsung 65" Frame QLED 4K, Art Mode, bezel personalizabil, mat.', 5999.99, 6999.99, "tv", 8, true, 4.5, { Brand: "Samsung", Diagonala: '65"', Tehnologie: "QLED", Mod: "Art Mode" }],
  ['Televizor TCL 55" C745', 'TCL 55" QLED 4K, 144Hz, HDR10+, Dolby Vision, Google TV, Game Master.', 2999.99, 3499.99, "tv", 17, true, 4.2, { Brand: "TCL", Diagonala: '55"', Tehnologie: "QLED", Refresh: "144Hz" }],
  ['Televizor LG 65" QNED', 'LG 65" QNED 4K, 120Hz, Dolby Vision, Quantum Dot, NanoCell, webOS.', 4499.99, 5199.99, "tv", 12, true, 4.3, { Brand: "LG", Diagonala: '65"', Tehnologie: "QNED" }],
]
products.push(...tv)

// Category 8: Audio-Video (20)
const av = [
  ["Soundbar Sony HT-A7000", "Sony 7.1.2, Dolby Atmos, 360 Spatial Sound, subwoofer wireless.", 4999.99, 5799.99, "audio-video", 9, true, 4.5, { Brand: "Sony", Canale: "7.1.2", Dolby: "Atmos" }],
  ["Soundbar Samsung HW-Q990C", "Samsung 11.1.4, Dolby Atmos, Q-Symphony, SpaceFit Sound Pro.", 5999.99, 6999.99, "audio-video", 7, true, 4.7, { Brand: "Samsung", Canale: "11.1.4", Dolby: "Atmos" }],
  ["Boxă portabilă JBL Flip 6", "JBL Flip 6, 12h, IP67, bass radiatoare, PartyBoost.", 399.99, 479.99, "audio-video", 30, true, 4.5, { Brand: "JBL", Autonomie: "12h", "Rezistent apă": "IP67" }],
  ["Boxă portabilă Sony SRS-XB100", "Sony SRS-XB100, 16h, IP67, cârlig, sunet clar.", 199.99, 249.99, "audio-video", 28, false, 4.3, { Brand: "Sony", Autonomie: "16h", "Rezistent apă": "IP67" }],
  ["Set boxe 5.1 Logitech Z906", "Logitech Z906, 500W RMS, THX, 6 boxe.", 1999.99, 2399.99, "audio-video", 14, true, 4.4, { Brand: "Logitech", Canale: "5.1", Putere: "500W RMS" }],
  ["Căști Beats Studio Pro", "Beats Studio Pro, noise canceling, Spatial Audio, 40h, USB-C.", 1799.99, 1999.99, "audio-video", 16, true, 4.4, { Brand: "Beats", "Noise canceling": "Da", "Spatial Audio": "Da", Autonomie: "40h" }],
  ["Microfon Blue Yeti X", "Blue Yeti X USB, 4 capsule, RGB, pattern-uri multiple, 192kHz.", 499.99, 599.99, "audio-video", 22, false, 4.5, { Brand: "Blue", Conexiune: "USB" }],
  ["Căști Sennheiser Momentum 4", "Sennheiser Momentum 4, Adaptive NC, 60h, aptX Adaptive, USB-C.", 1999.99, 2299.99, "audio-video", 13, true, 4.6, { Brand: "Sennheiser", "Noise canceling": "Adaptiv", Autonomie: "60h" }],
  ["Player Sony Walkman NW-A306", "Sony Walkman NW-A306, Android, 32GB, Hi-Res, microSD, LDAC.", 1499.99, 1799.99, "audio-video", 11, true, 4.3, { Brand: "Sony", Stocare: "32GB", "Hi-Res": "Da" }],
  ["Amplificator Marantz PM6007", "Marantz PM6007, 2x45W, MM, DAC, coaxial, optic.", 2499.99, 2899.99, "audio-video", 8, true, 4.5, { Brand: "Marantz", Putere: "2x45W", DAC: "Da" }],
  ["Receiver Denon AVR-X2800H", "Denon 7.2, Dolby Atmos, 8K, HEOS, Audyssey, 95W/canal.", 3499.99, 3999.99, "audio-video", 6, true, 4.4, { Brand: "Denon", Canale: "7.2", Dolby: "Atmos", "8K": "Da" }],
  ["Set boxe JBL Stage 5.1", "JBL Stage 5.1, 260W, subwoofer 10\", polimer.", 2999.99, 3499.99, "audio-video", 10, true, 4.3, { Brand: "JBL", Canale: "5.1" }],
  ["Căști gaming Corsair HS80", "Corsair HS80, Dolby Atmos, microfon omnidirectional, 20h.", 499.99, 599.99, "audio-video", 20, false, 4.3, { Brand: "Corsair", Sunet: "Dolby Atmos", Autonomie: "20h" }],
  ["Convertor Bluetooth 5.3", "BT 5.3, aptX HD, LDAC, USB-C, 3.5mm, 15h.", 149.99, 199.99, "audio-video", 26, false, 4.2, { Versiune: "Bluetooth 5.3", Codec: "aptX HD, LDAC" }],
  ["Boxă smart Google Nest Audio", "Google Nest Audio, Google Assistant, 30W, echilibrat.", 399.99, 499.99, "audio-video", 24, false, 4.2, { Brand: "Google", Asistent: "Google Assistant", Putere: "30W" }],
  ["Cablu optic Toslink 2m", "Toslink 2m, conectori aurii, fibră optică, 5.1/7.1.", 39.99, null, "audio-video", 30, false, 4.1, { Lungime: "2m" }],
  ["Bază încărcare wireless căști", "Bază Qi, 15W, LED, compatibil universal.", 129.99, 149.99, "audio-video", 18, false, 4.0, { Standard: "Qi", Putere: "15W" }],
  ["Videoproiector Epson EH-TW7100", "Epson 4K PRO-UHD, 3000 lumini, HDR10, 3LCD, 120\".", 6999.99, 7999.99, "audio-video", 6, true, 4.5, { Brand: "Epson", Rezoluție: "4K PRO-UHD", Luminozitate: "3000 lumini" }],
  ["Set microfon karaoke UHF", "2 microfoane UHF, 50m, 8h baterie, receiver inclus.", 349.99, 429.99, "audio-video", 20, false, 4.2, { Cantitate: "2", Frecvență: "UHF", Rază: "50m" }],
  ["Boxă portabilă UE BOOM 4", "UE BOOM 4, 15h, IP67, 360° sunet, PartyUp, 40m.", 499.99, 599.99, "audio-video", 22, true, 4.4, { Brand: "Ultimate Ears", Autonomie: "15h", "Rezistent apă": "IP67" }],
]
products.push(...av)

// Category 9: Foto (20)
const foto = [
  ["Aparat foto Sony A7C II", "Sony A7C II full-frame, 33MP, AI AF, 4K 60fps, 7 stopuri stabilizare.", 9499.99, 10499.99, "foto", 8, true, 4.6, { Brand: "Sony", Senzor: "Full-frame 33MP", Video: "4K 60fps", AF: "AI" }],
  ["Aparat foto Canon EOS R6 Mark II", "Canon R6 Mark II, 24.2MP, 4K 60fps, Dual Pixel AF II, 12fps.", 11999.99, 13499.99, "foto", 7, true, 4.7, { Brand: "Canon", Senzor: "24.2MP", Video: "4K 60fps" }],
  ["Aparat foto Fujifilm X-T5", "Fujifilm X-T5 APS-C, 40.2MP, 6.2K, film simulations, IBIS.", 9499.99, 10499.99, "foto", 10, true, 4.6, { Brand: "Fujifilm", Senzor: "APS-C 40.2MP", Video: "6.2K", IBIS: "Da" }],
  ["Lentilă Sigma 24-70mm f/2.8", "Sigma Art 24-70mm f/2.8 DG DN, Sony E, autofocus rapid.", 5499.99, 6199.99, "foto", 12, true, 4.6, { Brand: "Sigma", Distanță: "24-70mm", Diafragmă: "f/2.8" }],
  ["Lentilă Canon RF 50mm f/1.8", "Canon RF 50mm f/1.8 STM, portret, ușor, AF silentios.", 1299.99, 1499.99, "foto", 18, true, 4.5, { Brand: "Canon", Distanță: "50mm", Diafragmă: "f/1.8" }],
  ["Gimbal DJI RS 4 Pro", "DJI RS 4 Pro, 4.5kg payload, LiDAR AF, încărcare rapidă.", 4999.99, 5799.99, "foto", 7, true, 4.5, { Brand: "DJI", Payload: "4.5kg", LiDAR: "Da" }],
  ["Cameră video Sony ZV-E1", "Sony ZV-E1 full-frame, 4K 120fps, Active Stabilization, AI.", 8999.99, 9999.99, "foto", 9, true, 4.4, { Brand: "Sony", Senzor: "Full-frame", Video: "4K 120fps" }],
  ["Card CFexpress 160GB", "Sony CFexpress Type A, 160GB, 800MB/s citire, 700MB/s scriere.", 699.99, 799.99, "foto", 15, false, 4.4, { Capacitate: "160GB", Citire: "800MB/s", Tip: "CFexpress Type A" }],
  ["Aparat instant Fujifilm Instax Mini 12", "Instax Mini 12, format card, selfie mirror, expunere automată.", 299.99, 349.99, "foto", 25, false, 4.3, { Brand: "Fujifilm", Format: "Mini", Tip: "Instant" }],
  ["Trepied Manfrotto 190X", "Manfrotto 190X, 1.6m, 7kg, 3-way head, 4 secțiuni.", 899.99, 999.99, "foto", 14, false, 4.4, { Brand: "Manfrotto", "Înălțime max": "1.6m", Payload: "7kg" }],
  ["Bliț extern Godox V1", "Godox V1 round head, 76Ws, li-ion, TTL, HSS, 1.5s reciclare.", 599.99, 699.99, "foto", 16, false, 4.4, { Brand: "Godox", Putere: "76Ws", TTL: "Da", HSS: "Da" }],
  ["Geantă aparat Lowepro ProTactic", "Lowepro ProTactic 450 AW, 2 corpuri + 6 lentile, impermeabil.", 799.99, 949.99, "foto", 11, false, 4.3, { Brand: "Lowepro", Capacitate: "2 corpuri + 6 lentile" }],
  ["Aparat foto Nikon Zf", "Nikon Zf full-frame, 24.5MP, 4K, VR 8 stopuri, retro design.", 9499.99, 10499.99, "foto", 6, true, 4.6, { Brand: "Nikon", Senzor: "Full-frame 24.5MP", VR: "8 stopuri" }],
  ["Lentilă Sony FE 85mm f/1.4 GM", "Sony GM 85mm f/1.4, portret, XA, Nano AR, 11 lame.", 6999.99, 7999.99, "foto", 8, true, 4.7, { Brand: "Sony", Distanță: "85mm", Diafragmă: "f/1.4", Serie: "GM" }],
  ["Dronă DJI Mini 4 Pro", "DJI Mini 4 Pro, <249g, 4K 100fps, obstacle avoidance, 34min.", 4999.99, 5799.99, "foto", 14, true, 4.7, { Brand: "DJI", Greutate: "<249g", Video: "4K 100fps", Zbor: "34min" }],
  ['Monitor foto Eizo 27" 4K', 'Eizo ColorEdge CS2740, 27" 4K, 99% AdobeRGB, USB-C.', 7999.99, 8999.99, "foto", 5, true, 4.6, { Brand: "Eizo", Diagonala: '27"', Rezoluție: "4K", AdobeRGB: "99%" }],
  ["Kit curățare lentile", "Soluție 50ml, lavetă microfibra 5, pensulă, spray.", 59.99, 79.99, "foto", 30, false, 4.2, { Piese: "8", Soluție: "50ml" }],
  ["Aparat foto Leica Q3", "Leica Q3 full-frame, 60MP, 28mm f/1.7, 8K, EVF, OIS.", 28999.99, 31999.99, "foto", 3, true, 4.8, { Brand: "Leica", Senzor: "Full-frame 60MP", Obiectiv: "28mm f/1.7" }],
  ["Baterie Sony NP-FZ100", "Sony NP-FZ100, 2280mAh, li-ion, Alpha seria 7, 9.", 299.99, 349.99, "foto", 22, false, 4.3, { Brand: "Sony", Capacitate: "2280mAh" }],
  ["Aparat foto Panasonic Lumix S5 II", "Panasonic S5 II full-frame, 24.2MP, 6K, PDAF, IBIS, Dual Native ISO.", 7999.99, 8999.99, "foto", 8, true, 4.5, { Brand: "Panasonic", Senzor: "Full-frame 24.2MP", Video: "6K", IBIS: "Da" }],
]
products.push(...foto)

// Category 10: Electrocasnice (20)
const elec = [
  ['Frigider Samsung 450L French Door', 'Samsung 450L French Door, No Frost, Twin Cooling, alimentare apă.', 5999.99, 6999.99, "electrocasnice", 8, true, 4.4, { Brand: "Samsung", Capacitate: "450L", "No Frost": "Da" }],
  ['Frigider LG 400L Side-by-Side', 'LG 400L, Door Cooling+, Smart ThinQ, Wi-Fi.', 5499.99, 6499.99, "electrocasnice", 10, true, 4.3, { Brand: "LG", Capacitate: "400L", Smart: "ThinQ" }],
  ['Mașină de spălat Whirlpool 10kg', 'Whirlpool 10kg, 1400 RPM, 6th Sense, invertor, clasa A.', 3699.99, 4299.99, "electrocasnice", 14, true, 4.3, { Brand: "Whirlpool", Capacitate: "10kg", Viteza: "1400 RPM" }],
  ['Mașină de spălat LG 9kg', 'LG 9kg, AI DD, 1600 RPM, Steam, WiFi, invertor.', 3499.99, 3999.99, "electrocasnice", 18, true, 4.4, { Brand: "LG", Capacitate: "9kg" }],
  ['Uscător rufe Samsung 8kg', 'Samsung 8kg Heat Pump, OptimalDry, Smart Control.', 4499.99, 5199.99, "electrocasnice", 12, true, 4.4, { Brand: "Samsung", Capacitate: "8kg", Tehnologie: "Pompă căldură" }],
  ['Aragaz Beko 4 ochiuri + cuptor', 'Beko 4 ochiuri gaz, cuptor electric 65L, grill, auto-curățare.', 2199.99, 2599.99, "electrocasnice", 20, true, 4.2, { Brand: "Beko", Ochiuri: "4 gaz", Cuptor: "65L electric" }],
  ['Mașină cafea automată Philips', 'Philips Series 3200, macină boabe, 12 rețete, spumator lapte.', 2199.99, 2599.99, "electrocasnice", 22, true, 4.3, { Brand: "Philips", Rețete: "12", AquaClean: "Da" }],
  ['Blender KitchenAid', 'KitchenAid 5KSB1586, 1.6L, 580W, 7 viteze, bol sticlă.', 1499.99, 1799.99, "electrocasnice", 14, false, 4.4, { Brand: "KitchenAid", Capacitate: "1.6L", Putere: "580W" }],
  ['Aspirator Dyson V12 Detect', 'Dyson V12 Detect Slim, laser detect, 2 chiitoare, 60min, LCD.', 2999.99, 3499.99, "electrocasnice", 16, true, 4.5, { Brand: "Dyson", Autonomie: "60min", Laser: "Da" }],
  ['Robot aspirator iRobot Roomba j9', 'iRobot Roomba j9+, autogolire, PrecisionVision, hărți.', 4499.99, 5199.99, "electrocasnice", 9, true, 4.3, { Brand: "iRobot", "Auto-golire": "Da" }],
  ['Fier călcat Philips Azur', 'Philips Azur Elite, 3200W, 350ml, talpă Tefal, 50g/min abur.', 399.99, 479.99, "electrocasnice", 24, false, 4.3, { Brand: "Philips", Putere: "3200W" }],
  ['Mașină tuns iarba Flymo', 'Flymo EasiGlide 360, 1200W, 34cm, sac 30L, pliabil.', 549.99, 649.99, "electrocasnice", 28, false, 4.2, { Brand: "Flymo", Putere: "1200W", "Lățime tăiere": "34cm" }],
  ['Mașină de spălat vase Bosch 14 seturi', 'Bosch 14 seturi, PerfectDry, EcoSilence, 6 programe.', 3999.99, 4599.99, "electrocasnice", 11, true, 4.5, { Brand: "Bosch", Seturi: "14" }],
  ['Masă călcat cu fier integrat', 'Masă 2000W, abur 30g/min, ventilație, pliabilă.', 699.99, 849.99, "electrocasnice", 15, false, 4.0, { Putere: "2000W", Pliabil: "Da" }],
  ['Purificator Dyson HP09', 'Dyson HP09 Hot+Cool, HEPA H13, 350° rotire, purificator+încălzitor.', 3499.99, 3999.99, "electrocasnice", 10, true, 4.4, { Brand: "Dyson", Filtru: "HEPA H13" }],
  ['Cuptor microunde LG 32L', 'LG 32L, Smart Inverter, 1000W, grill, EasyClean.', 699.99, 799.99, "electrocasnice", 20, false, 4.2, { Brand: "LG", Capacitate: "32L", Putere: "1000W" }],
  ['Robot bucătărie Bosch MUM5', 'Bosch MUM5, 1000W, 4L, blender, răzătoare, accesorii.', 999.99, 1199.99, "electrocasnice", 17, true, 4.3, { Brand: "Bosch", Putere: "1000W", Capacitate: "4L" }],
  ['Plită inducție Samsung 4 zone', 'Samsung 4 zone, FlexZone, PowerBoost, siguranță copii.', 3299.99, 3799.99, "electrocasnice", 13, true, 4.4, { Brand: "Samsung", Zone: "4" }],
  ['Friteuză aer Tefal Easy Fry', 'Tefal Easy Fry 6.5L, 1800W, 8 programe, touch.', 599.99, 699.99, "electrocasnice", 22, true, 4.3, { Brand: "Tefal", Capacitate: "6.5L", Putere: "1800W" }],
  ['Aspirator robot Roborock Q8 Max', 'Roborock Q8 Max, 5500Pa, LiDAR, autogolire, 180min.', 2999.99, 3499.99, "electrocasnice", 14, true, 4.5, { Brand: "Roborock", Sucțiune: "5500Pa" }],
]
products.push(...elec)

// Category 11: Climatizare (20)
const clim = [
  ['Aer condiționat LG 24000 BTU', 'LG 24000BTU Inverter, răcire/încălzire, Wi-Fi, 4 moduri.', 3999.99, 4599.99, "climatizare", 8, true, 4.4, { Brand: "LG", Capacitate: "24000 BTU", Invertor: "Da" }],
  ['Aer condiționat Samsung 18000 BTU', 'Samsung 18000BTU, Wind-Free, Inverter, 4Way Swing.', 3499.99, 3999.99, "climatizare", 11, true, 4.3, { Brand: "Samsung", Capacitate: "18000 BTU" }],
  ['Aer condiționat Daikin 12000 BTU', 'Daikin 12000BTU, Inverter, R-32, 3D Airflow, filtrat fin.', 2999.99, 3499.99, "climatizare", 14, true, 4.5, { Brand: "Daikin", Capacitate: "12000 BTU" }],
  ['Purificator aer Xiaomi 4 Pro', 'Xiaomi Mi Air Purifier 4 Pro, 500m³/h, HEPA H13, PM2.5.', 1299.99, 1499.99, "climatizare", 22, true, 4.4, { Brand: "Xiaomi", Debit: "500 m³/h", Filtru: "HEPA H13" }],
  ['Dezumidificator Meaco 20L', 'Meaco 20L/zi, 45m², funcție uscare rufe, HEPA, timer.', 1499.99, 1799.99, "climatizare", 18, true, 4.3, { Brand: "Meaco", Capacitate: "20L/zi" }],
  ['Ventilator Dyson AM07', 'Dyson AM07, Air Multiplier, 10 viteze, oscilare, telecomandă.', 999.99, 1199.99, "climatizare", 24, false, 4.3, { Brand: "Dyson", Tehnologie: "Air Multiplier" }],
  ['Ventilator staționar Meaco 16\"', 'MeacoFan 16\", 26dB, DC motor, 12 viteze, oscilare.', 599.99, 699.99, "climatizare", 28, false, 4.4, { Brand: "Meaco", Diametru: '16"', Zgomot: "26dB" }],
  ['Încălzitor IR DeLonghi', 'DeLonghi Dragon 4, 2500W, ulei, termostat, 3 puteri.', 599.99, 699.99, "climatizare", 20, false, 4.2, { Brand: "DeLonghi", Putere: "2500W", Tip: "Ulei" }],
  ['Convector electric Mill', 'Mill 2000W, Wi-Fi, ecran touch, 24h programare.', 449.99, 549.99, "climatizare", 24, false, 4.2, { Brand: "Mill", Putere: "2000W" }],
  ['Pompă de căldură Mitsubishi', 'Mitsubishi Zubadan 14kW, încălzire/răcire, R32, -25°C funcționare.', 12999.99, 14999.99, "climatizare", 5, true, 4.6, { Brand: "Mitsubishi", Putere: "14kW", "Funcționare": "-25°C" }],
  ['Aer condiționat portabil 12000 BTU', 'AC portabil 12.000BTU, 4 roți, furtun evacuare, telecomandă.', 1999.99, 2399.99, "climatizare", 15, true, 4.0, { Capacitate: "12000 BTU", Tip: "Portabil" }],
  ['Purificator aer Philips 800i', 'Philips 800i, 270m³/h, NanoProtect, PM2.5, mod auto.', 1799.99, 2099.99, "climatizare", 17, true, 4.3, { Brand: "Philips", Debit: "270 m³/h" }],
  ['Umidificator ultrasunete 5L', 'Umidificator 5L, 50m², reglaj umiditate, timer, 35dB.', 299.99, 349.99, "climatizare", 25, false, 4.1, { Capacitate: "5L", Suprafață: "50m²" }],
  ['Ventilator plafonă Hunter', 'Hunter Apache 52\", 3 pale, reversibil, 3 viteze, silentios.', 799.99, 949.99, "climatizare", 14, false, 4.3, { Brand: "Hunter", Diametru: '52"' }],
  ['Aer condiționat LG 12000 BTU Artcool', 'LG Artcool 12000BTU, design sticlă, UV Nano, Inverter.', 4499.99, 5199.99, "climatizare", 7, true, 4.5, { Brand: "LG", Capacitate: "12000 BTU", Tehnologie: "Artcool" }],
  ['Purificator aer Levoit Core 300', 'Levoit Core 300, 200m³/h, HEPA H13, 99.97%, 24dB.', 499.99, 599.99, "climatizare", 28, false, 4.3, { Brand: "Levoit", Debit: "200 m³/h" }],
  ['Dezumidificator Electrolux 12L', 'Electrolux 12L/zi, 25m², uscare rufe, filtru lavabil.', 899.99, 1049.99, "climatizare", 22, false, 4.2, { Brand: "Electrolux", Capacitate: "12L/zi" }],
  ['Ventilator masă Xiaomi Smart', 'Xiaomi Smart Standing Fan 2, 120°, DC, 25dB, Wi-Fi.', 399.99, 479.99, "climatizare", 30, false, 4.3, { Brand: "Xiaomi", Conexiune: "Wi-Fi" }],
  ['Aer condiționat Fujitsu 9000 BTU', 'Fujitsu 9000BTU, Inverter, R32, 4 moduri, filtrare fină.', 2499.99, 2899.99, "climatizare", 19, true, 4.3, { Brand: "Fujitsu", Capacitate: "9000 BTU" }],
  ['Termostat smart Google Nest', 'Google Nest Learning Thermostat, auto-programare, știri, 95% eficiență.', 1299.99, 1499.99, "climatizare", 16, true, 4.5, { Brand: "Google", Tip: "Learning Thermostat" }],
]
products.push(...clim)

// Category 12: Gaming (20)
const gaming = [
  ['Consolă PlayStation 5 Pro', 'PS5 Pro 2TB, DualSense, Ray Tracing, 4K/60fps, 8K, SSD ultra-rapid.', 4299.99, 4799.99, "gaming", 15, true, 4.8, { Brand: "Sony", Stocare: "2TB SSD" }],
  ['Consolă Xbox Series X 2TB', 'Xbox Series X 2TB, 4K 120Hz, Game Pass 3 luni inclus.', 3299.99, 3699.99, "gaming", 18, true, 4.6, { Brand: "Microsoft", Stocare: "2TB", GamePass: "3 luni" }],
  ['Nintendo Switch 2', 'Nintendo Switch 2, ecran 8\" 1080p, 256GB, dock 4K.', 2199.99, 2499.99, "gaming", 20, true, 4.7, { Brand: "Nintendo", Ecran: '8" 1080p', Stocare: "256GB" }],
  ['Joc Elden Ring Shadow of Erdtree', 'Elden Ring + Shadow of Erdtree, PC/PS5/Xbox, RPG, open world.', 299.99, 349.99, "gaming", 25, true, 4.8, { Platformă: "Multi", Gen: "RPG" }],
  ['Joc GTA VI', 'Grand Theft Auto VI, PC/PS5/Xbox, open world, acțiune.', 349.99, 399.99, "gaming", 30, true, 4.9, { Platformă: "Multi", Gen: "Acțiune" }],
  ['Joc God of War Ragnarok', 'God of War Ragnarok, PS5, acțiune-aventură, mythologie nordică.', 249.99, 299.99, "gaming", 22, true, 4.7, { Platformă: "PS5", Gen: "Acțiune-Aventură" }],
  ['Tastatură gaming Logitech G915', 'Logitech G915 Wireless, GL Tactile, RGB, aluminiu, ultra-subțire.', 999.99, 1199.99, "gaming", 16, true, 4.5, { Brand: "Logitech", Tip: "Wireless", RGB: "Da" }],
  ['Mouse gaming Logitech G Pro X', 'Logitech G Pro X Superlight 2, HERO 2, 60g, wireless, 95h.', 699.99, 799.99, "gaming", 20, true, 4.7, { Brand: "Logitech", Senzor: "HERO 2", Greutate: "60g" }],
  ['Căști gaming Razer Kraken V4', 'Razer Kraken V4, HyperClear cardioid, RGB, 50mm, 7.1.', 449.99, 549.99, "gaming", 24, false, 4.3, { Brand: "Razer", Sunet: "7.1", Microfon: "HyperClear" }],
  ['Scaun gaming Secretlab Titan Evo', 'Secretlab Titan Evo 2025, piele sintetică, suport lombar ajustabil.', 2599.99, 2999.99, "gaming", 12, true, 4.7, { Brand: "Secretlab", Material: "Piele sintetică" }],
  ['Volan gaming Logitech G923', 'Logitech G923, TrueForce, force feedback, pedale, SHIFTER.', 1999.99, 2299.99, "gaming", 10, true, 4.4, { Brand: "Logitech", Tehnologie: "TrueForce" }],
  ['Set căști + microfon Razer BlackShark V2', 'Razer BlackShark V2, THX Spatial Audio, 50mm, microfon detașabil.', 349.99, 399.99, "gaming", 26, false, 4.4, { Brand: "Razer", Sunet: "THX Spatial" }],
  ['Joystick Thrustmaster T16000M', 'Thrustmaster T16000M, HallEffect, 16 butoane, POV Hat.', 699.99, 849.99, "gaming", 14, false, 4.3, { Brand: "Thrustmaster", Tehnologie: "HallEffect" }],
  ['Gamepad Xbox Elite Series 2', 'Xbox Elite 2, stick-uri reglabile, padele, 40h baterie, USB-C.', 899.99, 999.99, "gaming", 18, true, 4.6, { Brand: "Microsoft", Tip: "Elite Series 2" }],
  ['Gamepad PS5 DualSense Edge', 'DualSense Edge, stick-uri și butoane interschimbabile, trigger adaptiv.', 749.99, 849.99, "gaming", 20, true, 4.5, { Brand: "Sony", Model: "DualSense Edge" }],
  ['Mousepad gaming Steelseries QcK Heavy', 'SteelSeries QcK Heavy, 450x400x6mm, țesătură, cauciuc.', 119.99, 149.99, "gaming", 30, false, 4.4, { Brand: "SteelSeries", Grosime: "6mm" }],
  ['Set stick arcade Mayflash F500', 'Mayflash F500 Elite, Sanwa, PC/PS5/Xbox/Switch, arcade.', 599.99, 699.99, "gaming", 8, false, 4.3, { Brand: "Mayflash", Compatibilitate: "Multi-platformă" }],
  ['Ochelari gaming Gunnar', 'Gunnar Intercept, filtru lumină albastră, antireflex, cadru negru.', 249.99, 299.99, "gaming", 22, false, 4.1, { Brand: "Gunnar", Tehnologie: "Filtru lumină albastră" }],
  ['Scaun gaming DXRacer Formula', 'DXRacer Formula Series, piele PU, suport lombar, brațe 3D.', 1799.99, 2099.99, "gaming", 16, true, 4.3, { Brand: "DXRacer", Material: "Piele PU" }],
  ['Casetă jocuri Switch 12', 'Casetă transport 12 jocuri Nintendo Switch, husă siliconată.', 49.99, null, "gaming", 28, false, 4.2, { Capacitate: "12 jocuri" }],
]
products.push(...gaming)

// Category 13: Cărți (20)
const carti = [
  ['Carte Mindset - Carol Dweck', 'Mindset: Psihologia succesului, Carol Dweck, ediție nouă, 352 pagini.', 49.99, null, "carti", 20, false, 4.5, { Autor: "Carol Dweck", Pagini: "352" }],
  ['Carte Factfulness - Hans Rosling', 'Factfulness: Zece motive pentru care nu înțelegem lumea, 342 pagini.', 54.99, null, "carti", 25, false, 4.6, { Autor: "Hans Rosling", Pagini: "342" }],
  ['Carte Fluent Forever - Gabriel Wyner', 'Fluent Forever: Cum să înveți o limbă străină, 336 pagini.', 59.99, null, "carti", 18, false, 4.3, { Autor: "Gabriel Wyner", Pagini: "336" }],
  ['Carte Otilia - Mihail Sadoveanu', 'Otilia de Mihail Sadoveanu, roman al adolescenței, 200 pagini.', 29.99, null, "carti", 22, false, 4.2, { Autor: "Mihail Sadoveanu", Pagini: "200" }],
  ['Carte Enigma Otiliei - G. Călinescu', 'Enigma Otiliei, roman balzacian, 400 pagini.', 39.99, null, "carti", 15, false, 4.4, { Autor: "George Călinescu", Pagini: "400" }],
  ['Carte Baltagul - Mihail Sadoveanu', 'Baltagul, povestea Vitoriei Lipan, 240 pagini.', 29.99, null, "carti", 18, false, 4.5, { Autor: "Mihail Sadoveanu", Pagini: "240" }],
  ['Carte Ion - Liviu Rebreanu', 'Ion, roman realist, viața țărănimii ardelene, 480 pagini.', 34.99, null, "carti", 20, false, 4.4, { Autor: "Liviu Rebreanu", Pagini: "480" }],
  ['Carte Moromeții - Marin Preda', 'Moromeții, roman al satului românesc, 500 pagini.', 39.99, null, "carti", 16, false, 4.6, { Autor: "Marin Preda", Pagini: "500" }],
  ['Carte Mihail Strogoff - Jules Verne', 'Mihail Strogoff, aventură, curierul țarului, 300 pagini.', 34.99, null, "carti", 24, false, 4.3, { Autor: "Jules Verne", Pagini: "300" }],
  ['Carte Întoarcerea din Vis - Petre Țuțea', 'Petre Țuțea: Întoarcerea din Vis, șarje filozofice, 280 pagini.', 59.99, null, "carti", 12, false, 4.4, { Autor: "Petre Țuțea", Pagini: "280" }],
  ['Carte Dune - Frank Herbert', 'Dune, roman SF, 600 pagini, ediție specială, copertă cartonată.', 79.99, null, "carti", 20, true, 4.7, { Autor: "Frank Herbert", Pagini: "600" }],
  ['Carte Fundația - Isaac Asimov', 'Fundația, SF clasic, 320 pagini.', 49.99, null, "carti", 18, false, 4.6, { Autor: "Isaac Asimov", Pagini: "320" }],
  ['Carte Harry Potter Piatra Filozofală', 'Harry Potter și Piatra Filozofală, ediție ilustrată, 256 pagini.', 89.99, null, "carti", 25, true, 4.8, { Autor: "J.K. Rowling", Pagini: "256" }],
  ['Carte Mamă, vreau să fiu rockstar', 'Mamă, vreau să fiu rockstar, roman umoristic, 280 pagini.', 39.99, null, "carti", 20, false, 4.2, { Autor: "Alexandru Lamba", Pagini: "280" }],
  ['Carte Țesutul nevăzut al sufletului', 'Țesutul nevăzut al sufletului, psihologie, 320 pagini.', 49.99, null, "carti", 15, false, 4.3, { Autor: "Iulian Cristea", Pagini: "320" }],
  ['Carte Arta războiului - Sun Tzu', 'Arta războiului, strategie, 96 pagini, ediție de buzunar.', 24.99, null, "carti", 30, false, 4.4, { Autor: "Sun Tzu", Pagini: "96" }],
  ['Carte Puterea momentului prezent', 'Puterea momentului prezent, Eckhart Tolle, spiritual, 280 pagini.', 49.99, null, "carti", 20, false, 4.5, { Autor: "Eckhart Tolle", Pagini: "280" }],
  ['Carte Hobbitul - J.R.R. Tolkien', 'Hobbitul, fantasy, 320 pagini, ediție cartonată.', 59.99, null, "carti", 22, true, 4.7, { Autor: "J.R.R. Tolkien", Pagini: "320" }],
  ['Carte Zece negri mititei', 'Zece negri mititei, Agatha Christie, thriller, 256 pagini.', 39.99, null, "carti", 20, false, 4.5, { Autor: "Agatha Christie", Pagini: "256" }],
  ['Carte Codul lui Da Vinci', 'Codul lui Da Vinci, Dan Brown, thriller, 560 pagini.', 44.99, null, "carti", 18, false, 4.4, { Autor: "Dan Brown", Pagini: "560" }],
]
products.push(...carti)

// Category 14: Birotică (20)
const bir = [
  ['Stație andocare universală USB-C', 'Stație USB-C, HDMI 4K, 3xUSB, Ethernet, PD 100W.', 399.99, null, "birotica", 12, false, 4.1, { "Conexiune": "USB-C" }],
  ['Lampă birou LED BenQ', 'BenQ ScreenBar, lumină asimetrică, USB, 8 niveluri, auto-ajustare.', 399.99, 479.99, "birotica", 16, true, 4.4, { Brand: "BenQ", Tip: "LED" }],
  ['Birou ajustabil electric 140cm', 'Birou electric 140x70cm, 2 motoare, presetări, HPL, alb.', 2599.99, 2999.99, "birotica", 9, true, 4.5, { Dimensiuni: "140x70cm", Motor: "Dual" }],
  ['Scaun birou ergonomic Steelcase', 'Steelcase Gesture, 3D LiveBack, brațe ajustabile 360°, plasă.', 4999.99, 5799.99, "birotica", 6, true, 4.6, { Brand: "Steelcase", Material: "Plasă" }],
  ['Organizator birou 6 compartimente', 'Organizator bambus, 6 comp., suport telefon.', 89.99, null, "birotica", 18, false, 4.1, { Material: "Bambus", Compartimente: "6" }],
  ['Imprimantă Brother HL-L2350DW', 'Brother HL-L2350DW, laser, A4, duplex, WiFi, 30ppm.', 799.99, 949.99, "birotica", 20, true, 4.3, { Brand: "Brother", Tehnologie: "Laser" }],
  ['Set bibliorafturi 10 buc', 'Bibliorafturi mecanism, 500 foi, 7cm, 10 buc.', 99.99, null, "birotica", 24, false, 4.0, { Cantitate: "10" }],
  ['Set pix+stilou+marker premium', 'Pix Parker, stilou Waterman, marker Pilot, cutie cadou.', 249.99, null, "birotica", 14, false, 4.2, { Conține: "Pix, Stilou, Marker" }],
  ['Imprimantă multifuncțională Canon PIXMA', 'Canon PIXMA G3470, inkjet, print/scan/copie, rezervor reîncărcabil.', 499.99, 599.99, "birotica", 22, true, 4.2, { Brand: "Canon", Tehnologie: "Inkjet" }],
  ['Laminator A4 Fellowes', 'Fellowes Laminator A4, 2 role, 5 minute încălzire, 125 microni.', 199.99, 249.99, "birotica", 18, false, 4.1, { Brand: "Fellowes", Format: "A4" }],
  ['Telefon birou Gigaset', 'Gigaset A690, DECT, caller ID, căști, roșu, 200 de înregistrări.', 149.99, null, "birotica", 20, false, 4.0, { Brand: "Gigaset", Tehnologie: "DECT" }],
  ['Set markere whiteboard 8 culori', 'Markere whiteboard cu șters, 8 culori, vârf mediu, miros redus.', 39.99, null, "birotica", 30, false, 4.1, { Cantitate: "8" }],
  ['Tabla magnetică 120x90cm', 'Tabla magnetică, emailată, rame aluminiu, suport perete.', 299.99, 349.99, "birotica", 14, false, 4.2, { Dimensiuni: "120x90cm" }],
  ['Ruletă digitală Stanley', 'Stanley TLM99, laser, 30m, +/-2mm, Bluetooth.', 299.99, 349.99, "birotica", 16, false, 4.3, { Brand: "Stanley", Rază: "30m" }],
  ['Distrugător hârtii Rexel', 'Rexel Auto+ 80X, 80 foi, micro-tăiere, 4x40mm, 35L.', 1199.99, 1399.99, "birotica", 8, true, 4.3, { Brand: "Rexel", Capacitate: "80 foi" }],
  ['Set capsator + capsă 1000', 'Capsator birou metalic, 25 foi, capsă 26/6, 1000 buc.', 49.99, null, "birotica", 28, false, 4.0, { Material: "Metal" }],
  ['Stație meteo Oregon Scientific', 'Oregon Scientific, senzor exterior, barometru, prognoză, ceas.', 249.99, 299.99, "birotica", 12, false, 4.1, { Brand: "Oregon Scientific" }],
  ['Suport monitor dual', 'Suport monitor dual, 13-32\", VESA, brațe ajustabile, capacitate 8kg.', 199.99, 249.99, "birotica", 20, true, 4.3, { Compatibilitate: "13-32\"", VESA: "Da" }],
  ['Multifuncțională Epson EcoTank', 'Epson L3250, print/scan/copie, WiFi, rezervor 4500 pagini.', 699.99, 799.99, "birotica", 18, true, 4.3, { Brand: "Epson", Tehnologie: "EcoTank" }],
  ['Calculator de birou Casio', 'Casio MS-80B, 8 cifre, display solar+baterie, taxe.', 49.99, null, "birotica", 26, false, 4.0, { Brand: "Casio", Cifre: "8" }],
]
products.push(...bir)

// Category 15: Bacanie (20)
const bac = [
  ['Cafea boabe Lavazza 1kg', 'Lavazza Qualità Oro, 100% Arabica, prăjire medie, 1kg.', 89.99, null, "bacanie", 24, false, 4.5, { Brand: "Lavazza", Tip: "Boabe", Greutate: "1kg" }],
  ['Cafea măcinată Jacobs 500g', 'Jacobs Kronung, 500g, aromă echilibrată, plic resigilabil.', 34.99, null, "bacanie", 18, false, 4.3, { Brand: "Jacobs", Tip: "Măcinată", Greutate: "500g" }],
  ['Ceai verde Lotus 100 plicuri', 'Ceai verde Lotus, cutie 100 plicuri, antioxidant, natural.', 24.99, null, "bacanie", 20, false, 4.1, { Brand: "Lotus", Cantitate: "100 plicuri" }],
  ['Ciocolată Milka 300g', 'Milka cu lapte, 300g, alpină, cremoasă.', 19.99, null, "bacanie", 22, false, 4.5, { Brand: "Milka", Greutate: "300g" }],
  ['Biscuiți Oreo 400g', 'Oreo cremă vanilie, pachet 400g.', 16.99, null, "bacanie", 18, false, 4.4, { Brand: "Oreo", Greutate: "400g" }],
  ['Apă minerală Borsec 2L x 6', 'Apă minerală carbogazoasă Borsec, 2L, 6 bucăți.', 18.99, null, "bacanie", 24, false, 4.3, { Brand: "Borsec", Volum: "2L x 6" }],
  ['Coca-Cola 2L x 6', 'Coca-Cola clasic, 2L, carbogazoasă, pachet 6.', 28.99, null, "bacanie", 20, false, 4.4, { Brand: "Coca-Cola", Volum: "2L x 6" }],
  ['Pepsi Max 330ml x 24', 'Pepsi Max fără zahăr, 330ml, doză, pachet 24.', 49.99, null, "bacanie", 16, false, 4.2, { Brand: "Pepsi", Volum: "330ml x 24" }],
  ['Bere Ursus 0.5L x 12', 'Ursus flagship, 0.5L, 5%, doză, pachet 12.', 39.99, null, "bacanie", 22, false, 4.3, { Brand: "Ursus", Volum: "0.5L x 12" }],
  ['Vin alb sec Cramele Recaș', 'Recaș Sauvignon Blanc, 0.75L.', 39.99, null, "bacanie", 14, false, 4.2, { Brand: "Cramele Recaș", Tip: "Alb sec", Volum: "0.75L" }],
  ['Vin roșu sec Purcari', 'Purcari Cabernet Sauvignon, 0.75L, maturat 12 luni.', 69.99, null, "bacanie", 16, false, 4.4, { Brand: "Purcari", Tip: "Roșu sec", Volum: "0.75L" }],
  ['Ulei măsline extravirgin 1L', 'Monini extravirgin, 1L, presat la rece.', 44.99, null, "bacanie", 18, false, 4.4, { Brand: "Monini", Tip: "Extravirgin", Volum: "1L" }],
  ['Orez Arborio 1kg', 'Risotto, 1kg, boabă rotundă, italian.', 14.99, null, "bacanie", 20, false, 4.2, { Brand: "Arborio", Tip: "Risotto", Greutate: "1kg" }],
  ['Paste Barilla 500g', 'Spaghetti Barilla, grâu dur, Italia.', 7.99, null, "bacanie", 28, false, 4.3, { Brand: "Barilla", Tip: "Spaghetti", Greutate: "500g" }],
  ['Conserve roșii Mutti 400g', 'Mutti cuburi, 400g, Italia, fără conservanți.', 9.99, null, "bacanie", 26, false, 4.3, { Brand: "Mutti", Tip: "Cuburi", Greutate: "400g" }],
  ['Unt Anchony 200g', 'Anchony 82% grăsime, 200g, înaltă calitate.', 16.99, null, "bacanie", 16, false, 4.2, { Brand: "Anchony", Greutate: "200g" }],
  ['Brânză telemea Cremissimo 500g', 'Telemea vacă, Cremissimo, 500g, maturată 60 zile.', 28.99, null, "bacanie", 20, false, 4.1, { Brand: "Cremissimo", Tip: "Telemea", Greutate: "500g" }],
  ['Iaurt grecesc Olympus 2x200g', 'Olympus 10% grăsime, proteic, 2x200g.', 12.99, null, "bacanie", 22, false, 4.3, { Brand: "Olympus" }],
  ['Nuci caju 200g', 'Caju prăjite ușor sărate, 200g, snack sănătos.', 19.99, null, "bacanie", 18, false, 4.3, { Tip: "Caju", Greutate: "200g" }],
  ['Cereale Simply 500g', 'Cereale integrale cu stafide și nuci, 500g, fără zahăr.', 24.99, null, "bacanie", 20, false, 4.1, { Brand: "Simply", Greutate: "500g" }],
]
products.push(...bac)

// Category 16: Fashion (20)
const fash = [
  ['Geacă iarnă Marmot', 'Marmot impermeabilă, Gore-Tex, căptușeală termică, 2 buzunare.', 899.99, 1099.99, "fashion", 12, true, 4.7, { Brand: "Marmot", Material: "Gore-Tex" }],
  ['Geacă primăvară The North Face', 'TNF impermeabilă, capuță ajustabilă, ușoară.', 599.99, 699.99, "fashion", 14, true, 4.4, { Brand: "The North Face" }],
  ['Palton bărbătesc lână', 'Palton lână, negru, țesătură fină, design clasic, 100% lână.', 499.99, 599.99, "fashion", 18, true, 4.3, { Material: "Lână 100%", Culoare: "Negru" }],
  ['Rochie vară bumbac organic', 'Rochie Zara, model floral, bretele reglabile, bumbac organic.', 149.99, null, "fashion", 20, false, 4.2, { Brand: "Zara", Material: "Bumbac organic" }],
  ['Blugi Levi\'s 501', 'Levi\'s 501, croială dreaptă, denim elastic, 5 buzunare.', 349.99, 399.99, "fashion", 14, true, 4.5, { Brand: "Levi's", Model: "501" }],
  ['Cămașă Tommy Hilfiger', 'Tommy Hilfiger casual, mânecă lungă, imprimeu logo, bumbac.', 299.99, null, "fashion", 24, false, 4.3, { Brand: "Tommy Hilfiger", Material: "Bumbac" }],
  ['Tricou Adidas bumbac', 'Adidas Essentials, bumbac organic, logo brodat, negru.', 129.99, null, "fashion", 16, false, 4.4, { Brand: "Adidas", Material: "Bumbac organic" }],
  ['Adidași Nike Air Max', 'Nike Air Max 90, talpă Air, piele întoarsă, plasă textilă.', 649.99, 749.99, "fashion", 22, true, 4.6, { Brand: "Nike", Model: "Air Max 90" }],
  ['Pantofi Geox', 'Geox membrană respirabilă, talpă cauciuc, piele naturală.', 449.99, null, "fashion", 24, false, 4.4, { Brand: "Geox", Material: "Piele" }],
  ['Ghete hiking Salomon', 'Salomon Gore-Tex, talpă Contagrip, protecție vârf.', 799.99, 899.99, "fashion", 18, true, 4.5, { Brand: "Salomon" }],
  ['Sandale Crocs', 'Crocs Classic, suport arc, ușoare, culori multiple.', 129.99, null, "fashion", 26, false, 4.2, { Brand: "Crocs" }],
  ['Ceas Fossil automat', 'Fossil automat, mecanism elvețian, 42mm, brățară inox.', 899.99, 1099.99, "fashion", 12, true, 4.3, { Brand: "Fossil" }],
  ['Ochelari Ray-Ban Aviator', 'Ray-Ban Aviator, lentile polarizate, ramă aurie.', 749.99, null, "fashion", 22, false, 4.6, { Brand: "Ray-Ban", Model: "Aviator" }],
  ['Geantă Guess damă', 'Guess piele ecologică, lanț detașabil, 25cm.', 399.99, 499.99, "fashion", 10, true, 4.3, { Brand: "Guess" }],
  ['Rucsac urban 30L', 'Rucsac 30L, compartiment laptop 15.6\", USB, anti-furt.', 199.99, null, "fashion", 20, false, 4.2, { Capacitate: "30L" }],
  ['Șapcă New Era 59FIFTY', 'New Era snapback, brodat NY, lână.', 149.99, null, "fashion", 26, false, 4.3, { Brand: "New Era", Model: "59FIFTY" }],
  ['Curea piele bărbătească', 'Piele naturală, cataramă, 3.5cm, maro.', 129.99, null, "fashion", 22, false, 4.1, { Material: "Piele" }],
  ['Fular cașmir 100%', 'Cașmir 100%, 180x70cm, gri, margini finisate.', 249.99, null, "fashion", 14, false, 4.3, { Material: "Cașmir 100%" }],
  ['Mănuși piele nappa', 'Piele nappa, căptușite mătase, negru, M.', 179.99, null, "fashion", 20, false, 4.2, { Material: "Piele nappa" }],
  ['Cravată Emporio Armani', 'Mătase, 7cm, dungi, bleumarin.', 299.99, null, "fashion", 16, false, 4.3, { Brand: "Emporio Armani", Material: "Mătase" }],
]
products.push(...fash)

// Category 17: Îngrijire personală (20)
const ip = [
  ['Parfum Chanel No. 5', 'Chanel No.5 EDP, 50ml, floral-aldehidat.', 749.99, null, "ingrijire-personala", 24, false, 4.7, { Brand: "Chanel", Tip: "EDP", Volum: "50ml" }],
  ['Parfum Dior Sauvage', 'Dior Sauvage EDP, 60ml, aromatic-proaspăt.', 599.99, null, "ingrijire-personala", 22, false, 4.6, { Brand: "Dior", Tip: "EDP", Volum: "60ml" }],
  ['Șampon Kerastase Resistance', 'Kerastase Resistance, 250ml, fortifiant, păr deteriorat.', 119.99, null, "ingrijire-personala", 26, false, 4.4, { Brand: "Kerastase", Volum: "250ml" }],
  ['Balsam Olaplex No.5', 'Olaplex No.5, 250ml, reconstrucție legături capilare.', 99.99, null, "ingrijire-personala", 20, false, 4.5, { Brand: "Olaplex", Volum: "250ml" }],
  ['Aparat epilat Philips Lumea', 'Philips Lumea Prestige, IPL, 5 atașamente, senzor piele.', 2199.99, 2499.99, "ingrijire-personala", 14, true, 4.4, { Brand: "Philips", Tehnologie: "IPL" }],
  ['Periuță Oral-B iO10', 'Oral-B iO10 AI, ecran interactiv, 7 moduri, travel case.', 999.99, 1199.99, "ingrijire-personala", 18, true, 4.6, { Brand: "Oral-B" }],
  ['Aparat ras Philips', 'Philishave, 3 capete rotative, uscat/umed, 60min.', 449.99, null, "ingrijire-personala", 20, false, 4.3, { Brand: "Philips" }],
  ['Trimmer barbă Braun', 'Braun, 10 setări, lame auto-ascuțite, lavabil.', 299.99, null, "ingrijire-personala", 18, false, 4.3, { Brand: "Braun" }],
  ['Set cadou bărbătesc 3 piese', 'Gel duș, after-shave, deodorant, cutie premium.', 149.99, null, "ingrijire-personala", 22, false, 4.1, { Piese: "3" }],
  ['Deodorant Nivea 200ml', 'Nivea Fresh Active, 48h, spray.', 19.99, null, "ingrijire-personala", 26, false, 4.2, { Brand: "Nivea", Volum: "200ml" }],
  ['Gel duș Dove 400ml', 'Dove Deeply Nourishing, 400ml, hidratant.', 24.99, null, "ingrijire-personala", 22, false, 4.3, { Brand: "Dove", Volum: "400ml" }],
  ['Trusă manichiură 10 piese', 'Oțel inoxidabil, 10 piese, husă piele.', 89.99, null, "ingrijire-personala", 16, false, 4.2, { Piese: "10" }],
  ['Parfum Paco Rabanne Invictus', 'Invictus EDP, 100ml, proaspăt, aromatic.', 449.99, null, "ingrijire-personala", 20, false, 4.4, { Brand: "Paco Rabanne", Tip: "EDP", Volum: "100ml" }],
  ['Parfum Yves Saint Laurent Libre', 'Libre EDP, 50ml, floral, lavandă, feminin.', 549.99, null, "ingrijire-personala", 18, false, 4.5, { Brand: "YSL", Tip: "EDP", Volum: "50ml" }],
  ['Aparat tuns păr Wahl', 'Wahl 79602, lame inox, 12 ghidaje, profesional, 20W.', 199.99, null, "ingrijire-personala", 20, false, 4.3, { Brand: "Wahl" }],
  ['Uscător păr Dyson Supersonic', 'Dyson Supersonic, Air Multiplier, 4 atașamente, 1600W.', 1999.99, 2399.99, "ingrijire-personala", 16, true, 4.6, { Brand: "Dyson", Putere: "1600W" }],
  ['Set pilă electrică Callus', 'Pilă electrică, 2 role, 2 viteze, reîncărcabil USB.', 129.99, null, "ingrijire-personala", 20, false, 4.1, { Tip: "Electric" }],
  ['Placă întins păr ghd', 'ghd Platinum+, 185°C, tehnologie Ultra-zone, auto-frânare.', 899.99, null, "ingrijire-personala", 14, false, 4.5, { Brand: "ghd", Temperatură: "185°C" }],
  ['Ruj MAC Ruby Woo', 'MAC Ruby Woo, roșu mat, pigmentat.', 109.99, null, "ingrijire-personala", 22, false, 4.4, { Brand: "MAC" }],
  ['Încălzitor prosoape electric', 'Încălzitor prosoape, 500W, 10 bare, termostat, alb.', 499.99, 599.99, "ingrijire-personala", 10, false, 4.2, { Putere: "500W" }],
]
products.push(...ip)

// Category 18: Cosmetice (20)
const cosm = [
  ['Set machiaj Sephora 8 piese', 'Ruj, fard, rimel, corector, bureți, 8 piese.', 199.99, 249.99, "cosmetice", 24, true, 4.2, { Brand: "Sephora", Piese: "8" }],
  ['Fond de ten Estée Lauder Double Wear', 'Double Wear, 24h, SPF10, 30ml, multiple nuanțe.', 199.99, null, "cosmetice", 18, false, 4.6, { Brand: "Estée Lauder", Volum: "30ml" }],
  ['Set pensule machiaj 12 buc', 'Profesionale, mânere bambus, perii sintetici.', 149.99, null, "cosmetice", 18, false, 4.3, { Cantitate: "12" }],
  ['Cremă hidratantă Neutrogena SPF30', 'SPF30, 50ml, ten normal/mixt, non-comedogenic.', 59.99, null, "cosmetice", 22, false, 4.2, { Brand: "Neutrogena", SPF: "30" }],
  ['Ser retinol The Ordinary', 'Retinol 0.5% + Squalane, 30ml, anti-îmbătrânire.', 49.99, null, "cosmetice", 16, false, 4.3, { Brand: "The Ordinary", Concentrație: "0.5%" }],
  ['Ulei esențial lavandă 10ml', 'Lavandă 100%, aromoterapie, relaxare.', 29.99, null, "cosmetice", 22, false, 4.2, { Tip: "Lavandă", Volum: "10ml" }],
  ['Mască facială argilă', 'Argilă verde, purificatoare, detoxifiantă, 50ml.', 39.99, null, "cosmetice", 20, false, 4.1, { Tip: "Argilă", Volum: "50ml" }],
  ['Paletă farduri Anastasia Beverly Hills', 'ABH Soft Glam, 14 nuanțe, mate + sidefate.', 299.99, null, "cosmetice", 16, false, 4.5, { Brand: "Anastasia Beverly Hills", Nuanțe: "14" }],
  ['Corector Tarte Shape Tape', 'Tarte Shape Tape, 10ml, acoperire completă, hydratant.', 119.99, null, "cosmetice", 20, false, 4.5, { Brand: "Tarte", Volum: "10ml" }],
  ['Creion sprâncene NYX', 'NYX Micro Brow Pencil, precizie, 12 ore.', 39.99, null, "cosmetice", 28, false, 4.3, { Brand: "NYX" }],
  ['Mascara Too Faced Better Than Sex', 'Too Faced, volum, alungire, negru, 9ml.', 99.99, null, "cosmetice", 18, false, 4.4, { Brand: "Too Faced" }],
  ['Set demachiant Bioderma', 'Bioderma Sensibio H2O, 250ml + disc demachiant 2 buc.', 69.99, null, "cosmetice", 22, false, 4.4, { Brand: "Bioderma", Volum: "250ml" }],
  ['Exfoliant Paula\'s Choice BHA', 'Paula\'s Choice 2% BHA, 118ml, exfoliant chimic.', 119.99, null, "cosmetice", 18, false, 4.5, { Brand: "Paula's Choice", Concentrație: "2%" }],
  ['Fixativ păr L\'Oréal Paris', 'L\'Oréal Paris Elnett, 400ml, fixare puternică, fără lipici.', 39.99, null, "cosmetice", 26, false, 4.2, { Brand: "L'Oréal", Volum: "400ml" }],
  ['Buchet flori artificiale', 'Buchet 12 trandafiri, mătase, 50cm, decorativ.', 159.99, null, "cosmetice", 14, false, 4.1, { Cantitate: "12" }],
  ['Set beauty blender original', '4 bureți Beauty Blender, culori diferite, original.', 109.99, null, "cosmetice", 20, false, 4.3, { Brand: "Beauty Blender", Cantitate: "4" }],
  ['Aparat cosmetic LED facial', 'LED facial, 7 culori, anti-aging, acnee, USB-C.', 299.99, 349.99, "cosmetice", 12, true, 4.2, { Culori: "7" }],
  ['Trusă gene false 10 perechi', 'Ardell, 10 perechi, diverse stiluri, lipici inclus.', 59.99, null, "cosmetice", 24, false, 4.1, { Brand: "Ardell" }],
  ['Lotiune corporală CeraVe', 'CeraVe, 473ml, ceramide, hidratare 24h, non-gras.', 79.99, null, "cosmetice", 22, false, 4.5, { Brand: "CeraVe", Volum: "473ml" }],
  ['Stilou dermatograf permanent', 'Dermatograf, 0.5mm, negru, waterproof.', 29.99, null, "cosmetice", 18, false, 4.0, { Tip: "Permanent" }],
]
products.push(...cosm)

// Category 19: Casă (20)
const casa = [
  ['Set masă + 4 scaune lemn', 'Lemn masiv, masă 120x80cm, 4 scaune tapisate.', 1599.99, 1899.99, "casa", 14, true, 4.2, { Material: "Lemn masiv" }],
  ['Canapea colțar 3+1', 'Stofă, 3+1 locuri, ladă depozitare, gri', 3299.99, 3799.99, "casa", 18, true, 4.3, { Material: "Stofă", Locuri: "3+1" }],
  ['Dulap haine 3 uși', 'PAL melaminat, oglindă ușă centrală, rafturi + bare.', 2199.99, null, "casa", 12, false, 4.1, { Material: "PAL melaminat" }],
  ['Comodă TV 150cm', '150cm, 4 sertare, rafturi, PAL melaminat, alb.', 849.99, null, "casa", 14, false, 4.0, { Lățime: "150cm" }],
  ['Covor mătăsos 160x230cm', 'Imprimeu geometric, grosime 10mm.', 449.99, null, "casa", 10, false, 4.2, { Dimensiuni: "160x230cm" }],
  ['Perdele semi-voal 2 buc', 'Alb, 140x250cm, inel + dragă.', 129.99, null, "casa", 18, false, 4.1, { Dimensiuni: "140x250cm" }],
  ['Set așternut 300 fire 4 piese', 'Bumbac 300 fire, cearcaf + 2 pernă + pilotă.', 199.99, null, "casa", 12, false, 4.3, { Material: "Bumbac" }],
  ['Pernă memory foam', '60x40cm, husă detașabilă lavabilă.', 129.99, null, "casa", 16, false, 4.4, { Material: "Memory Foam" }],
  ['Set cuțite bucătărie 5 buc', 'Oțel inox, mâner lemn, bloc acrilic.', 299.99, null, "casa", 14, false, 4.4, { Piese: "5" }],
  ['Tigaie ceramică 28cm', 'GreenPan, antiaderent, fără PFOA, inducție.', 199.99, null, "casa", 18, false, 4.3, { Brand: "GreenPan" }],
  ['Lampadar metalic 3 brațe', 'Metalic negru, 180cm, abajur pânză.', 349.99, null, "casa", 14, false, 4.2, { Material: "Metal", Înălțime: "180cm" }],
  ['Oglinzi LED dressing 3 buc', 'Rotunde 60cm, luminozitate reglabilă.', 599.99, null, "casa", 16, false, 4.1, { Cantitate: "3" }],
  ['Cuiier perete lemn masiv', '5 cârlige metalice, design rustic.', 89.99, null, "casa", 18, false, 4.0, { Cârlige: "5" }],
  ['Șifonier 4 uși', 'PAL melaminat, 4 uși, 6 sertare, oglindă.', 3299.99, 3799.99, "casa", 8, true, 4.2, { Material: "PAL melaminat", Uși: "4" }],
  ['Masă extensibilă 6-8 locuri', 'Lemn masiv, 160-220cm, 6 scaune, extensie frunză.', 2599.99, 2999.99, "casa", 10, true, 4.3, { Material: "Lemn masiv" }],
  ['Canapea fixă 2 locuri', 'Velur, 2 locuri, gri, perne detașabile.', 1999.99, 2399.99, "casa", 14, true, 4.2, { Material: "Velur" }],
  ['Set veselă 24 piese', 'Porțelan, 6 farfurii, 6 boluri, 6 căni, 6 cești.', 299.99, null, "casa", 16, false, 4.3, { Piese: "24", Material: "Porțelan" }],
  ['Set cratițe 5 buc', 'Inox, 3 cratițe + 2 tigăi, capace sticlă.', 499.99, 599.99, "casa", 14, true, 4.3, { Piese: "5", Material: "Inox" }],
  ['Raft bibliotecă 5 etaje', 'PAL melaminat, 180x80x30cm, 5 rafturi, alb.', 399.99, null, "casa", 16, false, 4.1, { Etaie: "5" }],
  ['Pat matrimonial 160x200', 'Lemn masiv, somieră inclusă, 160x200cm.', 1999.99, 2399.99, "casa", 12, true, 4.3, { Material: "Lemn masiv", Dimensiuni: "160x200" }],
]
products.push(...casa)

// Category 20: Grădină (20)
const grad = [
  ['Masă grădină ratan 6 locuri', 'Ratan sintetic, 180x90cm, 6 scaune, perne incluse.', 2499.99, 2899.99, "gradina", 6, true, 4.3, { Material: "Ratan sintetic" }],
  ['Șezlong pliabil lemn', 'Lemn tec, țesătură textilenă, pernă cap.', 449.99, null, "gradina", 8, false, 4.2, { Material: "Lemn tec" }],
  ['Unelte grădinărit 7 buc', 'Lopată, greblă, sapă, furcă, mănuși, 7 buc.', 149.99, null, "gradina", 24, false, 4.2, { Piese: "7" }],
  ['Mașină tuns iarbă electrică 1200W', '1200W, 34cm lățime, sac 30L.', 699.99, 799.99, "gradina", 22, true, 4.3, { Putere: "1200W" }],
  ['Furtun grădină 30m', 'PVC, fitinguri alamă, rezistent UV.', 99.99, null, "gradina", 20, false, 4.1, { Lungime: "30m" }],
  ['Set mobilă grădină 4+1', 'Aluminiu, masă + 4 scaune, perne, pliabil.', 1799.99, 2099.99, "gradina", 10, true, 4.3, { Material: "Aluminiu" }],
  ['Căsuță grădină 2x3m', 'Lemn, acoperiș șindrilă, ușă + 2 ferestre, 6m².', 3999.99, 4799.99, "gradina", 5, true, 4.2, { Material: "Lemn" }],
  ['Pavaj curte 30x30x3cm 10buc', 'Beton, antiderapant, gri, 10 bucăți.', 89.99, null, "gradina", 20, false, 4.0, { Material: "Beton" }],
  ['Leagăn grădină 2 locuri', 'Metal, perne, acoperiș textil, 200x120cm.', 899.99, 1099.99, "gradina", 8, true, 4.2, { Material: "Metal" }],
  ['Grilaj lemn 1x2m', 'Lemn tratat, 1x2m, decorativ gard.', 129.99, null, "gradina", 18, false, 4.0, { Dimensiuni: "1x2m" }],
  ['Set udare picurare', 'Kit picurare 50m, 20 picurători, fitinguri.', 199.99, null, "gradina", 16, false, 4.2, { Lungime: "50m" }],
  ['Plantator 60cm ceramică', 'Ceramică glazurată, 60x25cm, pentru plante.', 149.99, null, "gradina", 18, false, 4.1, { Material: "Ceramică" }],
  ['Mașină tuns gard viu', 'Electrică 600W, 60cm lamă, 2 mânere.', 399.99, 499.99, "gradina", 14, true, 4.2, { Putere: "600W" }],
  ['Suport plantă 3 etaje', 'Metal forjat, 120x40x80cm, 3 etaje.', 199.99, null, "gradina", 16, false, 4.1, { Material: "Metal", Etaie: "3" }],
  ['Fântână decorativă cu pompă', 'Piatră artificială, pompă inclusă, LED, 60cm.', 599.99, null, "gradina", 8, false, 4.0, { Înălțime: "60cm" }],
  ['Ghiveci suspendat 25cm 10buc', 'Plastic, 25cm, 10 bucăți, diverse culori.', 49.99, null, "gradina", 28, false, 4.0, { Cantitate: "10" }],
  ['Lampă solare grădină 6buc', 'LED, solar, 6 lămpi, 8h, senzor crepuscular.', 89.99, null, "gradina", 24, false, 4.1, { Cantitate: "6" }],
  ['Hidroizolație balcon 5L', 'Hidroizolație lichidă, 5L, acoperire 10m².', 99.99, null, "gradina", 16, false, 4.0, { Volum: "5L" }],
  ['Cărucior grădină 100kg', 'Metal, roți pneumatice, 100kg capacitate.', 399.99, null, "gradina", 12, false, 4.2, { Capacitate: "100kg" }],
  ['Bancă grădină lemn 120cm', 'Lemn de pin tratat, 120x40x45cm, 2 locuri.', 349.99, null, "gradina", 14, false, 4.1, { Dimensiuni: "120x40x45" }],
]
products.push(...grad)

// Category 21: Bricolaj (20)
const bric = [
  ['Set scule electrice 3 buc', 'Bormașină 800W, șurubelniță, polizor, carcasă.', 599.99, 699.99, "bricolaj", 16, true, 4.3, { Piese: "3" }],
  ['Vopsea lavabilă 10L', 'Albă, 10L, 100m², rezistent abraziune.', 149.99, null, "bricolaj", 24, false, 4.1, { Volum: "10L" }],
  ['Bormașină percutoare Makita', 'Makita HP1640, 680W, 13mm, percutoare, mandrină.', 399.99, 499.99, "bricolaj", 18, true, 4.4, { Brand: "Makita", Putere: "680W" }],
  ['Set șurubelnițe Wera 12 buc', 'Wera Kraftform, 12 buc, hex, PH, PZ, Torx.', 249.99, 299.99, "bricolaj", 20, true, 4.5, { Brand: "Wera", Cantitate: "12" }],
  ['Polizor unghiular Bosch 125mm', 'Bosch GWS 750, 750W, 125mm, 11000 RPM.', 299.99, 349.99, "bricolaj", 22, true, 4.3, { Brand: "Bosch", Putere: "750W" }],
  ['Cutter profesional 18mm', 'Metal, lamă 18mm, blocare automată.', 29.99, null, "bricolaj", 28, false, 4.1, { "Lățime lamă": "18mm" }],
  ['Fierăstrău circular Makita', 'Makita 5008MG, 1800W, 7.25\", 5800 RPM.', 899.99, 1049.99, "bricolaj", 14, true, 4.4, { Brand: "Makita", Putere: "1800W" }],
  ['Nivelă cu laser 3 linii', 'Laser verde, 3 linii, auto-nivelare, magnet.', 299.99, null, "bricolaj", 18, true, 4.2, { Linii: "3", Culoare: "Verde" }],
  ['Set clești profesionali 5 buc', 'Oțel crom-vanadiu, mânere izolate, 5 buc.', 199.99, null, "bricolaj", 20, false, 4.3, { Cantitate: "5" }],
  ['Masă de lucru pliabilă', 'Aluminiu, 120x80cm, pliabilă, 200kg capacitate.', 599.99, null, "bricolaj", 12, false, 4.2, { Capacitate: "200kg" }],
  ['Bituri impact 100 buc', 'S2 steel, 25mm, PH/PZ/Hex/Torx, carcasă.', 79.99, null, "bricolaj", 26, false, 4.2, { Cantitate: "100" }],
  ['Drujbă electrică 1800W', '1800W, 40cm lamă, frână lanț, 14m/s.', 499.99, 599.99, "bricolaj", 14, true, 4.2, { Putere: "1800W" }],
  ['Adeziv universal 500ml', 'Montaj rapid, 500ml, transparent, exterior/interior.', 29.99, null, "bricolaj", 30, false, 4.0, { Volum: "500ml" }],
  ['Cască protecție 3M', '3M H701, reglabilă, ventilație, 400g.', 69.99, null, "bricolaj", 24, false, 4.2, { Brand: "3M" }],
  ['Set mănuși lucru nitril 10', 'Mănuși nitril, 10 perechi, mărime L.', 49.99, null, "bricolaj", 28, false, 4.1, { Cantitate: "10 perechi" }],
  ['Scară aluminiu 4 trepte', 'Aluminiu, 4 trepte, 150kg capacitate, anti-alunecare.', 249.99, null, "bricolaj", 18, false, 4.2, { Material: "Aluminiu" }],
  ['Trusă chei tubular 22 buc', 'Chei tubular, 8-22mm, oțel crom-vanadiu.', 149.99, null, "bricolaj", 20, false, 4.1, { Cantitate: "22" }],
  ['Pistol silicon manual', 'Pistol semirotativ, 310ml, metal.', 29.99, null, "bricolaj", 28, false, 4.0, { Tip: "Manual" }],
  ['Generator electric 2.5kW', '2.5kW, benzină, 4 timpi, 12h autonomie.', 1999.99, 2399.99, "bricolaj", 8, true, 4.3, { Putere: "2.5kW" }],
  ['Trusă chei fixe 8-19mm 8buc', 'Chei fixe, 8-19mm, oțel crom-vanadiu, suport.', 89.99, null, "bricolaj", 22, false, 4.1, { Cantitate: "8" }],
]
products.push(...bric)

// Category 22: Sport (20)
const sport = [
  ['Bicicletă MTB Pegas 27.5\"', 'Pegas mountain bike, 27.5\", 21 viteze, cadru aluminiu.', 1299.99, 1499.99, "sport", 18, true, 4.4, { Brand: "Pegas", Roți: '27.5"' }],
  ['Bicicletă oraș Pegas 28\"', 'Pegas oraș, 28\", 7 viteze, coș, lumină.', 999.99, null, "sport", 20, false, 4.2, { Brand: "Pegas", Roți: '28"' }],
  ['Trotinetă electrică Xiaomi Pro 2', 'Xiaomi Pro 2, 30km, 25km/h, 8.5\".', 2199.99, 2499.99, "sport", 22, true, 4.4, { Brand: "Xiaomi", Autonomie: "30km" }],
  ['Role quad inline', 'Quad inline, reglabile, frână, protecții incluse.', 299.99, null, "sport", 14, false, 4.2, { Tip: "Quad" }],
  ['Set gantere 2x10kg', 'Reglabile, cauciucate, mâner cromat.', 199.99, null, "sport", 24, false, 4.3, { Greutate: "2x10kg" }],
  ['Covoraș yoga 6mm', '183x68x6mm, PVC, non-alunecare, curea.', 89.99, null, "sport", 20, false, 4.3, { Grosime: "6mm" }],
  ['Bandă alergare 2.5CP', '2.5CP, 1-16km/h, 12 nivele înclinare, pliabilă.', 2999.99, 3499.99, "sport", 14, true, 4.1, { Motor: "2.5CP" }],
  ['Geantă sport Nike 45L', 'Nike Brasilia, 45L, compartiment pantofi.', 199.99, null, "sport", 18, false, 4.3, { Brand: "Nike", Capacitate: "45L" }],
  ['Set mănuși box 12oz', '12oz, piele sintetică, bandaje 4m incluse.', 149.99, null, "sport", 20, false, 4.2, { Greutate: "12oz" }],
  ['Geacă alergare Windstopper', 'Windstopper, reflectorizantă, 150g.', 299.99, 349.99, "sport", 8, true, 4.3, { Material: "Windstopper" }],
  ['Telescop Orion 70mm', 'Orion 70mm, ochelar 20+10mm, trepied, geantă.', 399.99, null, "sport", 14, false, 4.1, { Diametru: "70mm" }],
  ['Binoclu Nikon 10x42', 'Nikon Monarch, 10x42, BaK-4, impermeabil.', 1299.99, 1499.99, "sport", 10, true, 4.5, { Brand: "Nikon", Mărire: "10x" }],
  ['Elice fitness 3 buc', 'Elastice rezistență, 3 niveluri, ușoare.', 49.99, null, "sport", 28, false, 4.1, { Cantitate: "3" }],
  ['Boxă sport JBL Clip 4', 'JBL Clip 4, Bluetooth, IP67, carabinieră.', 199.99, null, "sport", 24, false, 4.3, { Brand: "JBL" }],
  ['Sticlă sport 750ml', 'Inox, dublu perete, 12h cald, 24h rece.', 79.99, null, "sport", 22, false, 4.3, { Material: "Inox", Volum: "750ml" }],
  ['Pantaloni sport alergare', 'Respirabil, elastic, buzunar fermoar, negru.', 149.99, null, "sport", 20, false, 4.1, { Material: "Poliester" }],
  ['Set kettlebell 8+12kg', '2 buc, 8+12kg, cauciucate, mâner cromat.', 249.99, null, "sport", 16, false, 4.2, { Greutate: "8+12kg" }],
  ['Crosă golf + 3 mingi', 'Crosă inox, 3 mingi, husă, începători.', 299.99, null, "sport", 10, false, 4.0, { Piese: "Crosă + 3 mingi" }],
  ['Masă ping pong pliabilă', 'Pliabilă, 152x274x76cm, 15mm, fileu inclus.', 1299.99, 1499.99, "sport", 8, true, 4.3, { Dimensiuni: "152x274x76cm" }],
  ['Rachetă tenis Wilson', 'Wilson Ultra 100, 300g, ecran 645cm².', 599.99, null, "sport", 14, false, 4.3, { Brand: "Wilson" }],
]
products.push(...sport)

// Category 23: Travel (20)
const travel = [
  ['Valiză cabină 70L', '70L, 4 roți duble, ABS, TSA, expandabilă.', 399.99, 499.99, "travel", 18, true, 4.3, { Material: "ABS", Capacitate: "70L" }],
  ['Rucsac drumeție 50L', 'Impermeabil, spate ergonomic, buzunar hidratare.', 349.99, null, "travel", 22, false, 4.4, { Capacitate: "50L" }],
  ['Husă telefon IPX8', 'IPX8, 10m adâncime, plutește, universală.', 49.99, null, "travel", 16, false, 4.1, { "Rezistență acvatică": "IPX8" }],
  ['Set prosop microfibra 2', 'Microfibră, 30x60cm, uscare rapidă, husă.', 49.99, null, "travel", 18, false, 4.2, { Material: "Microfibră" }],
  ['Adaptor călătorie universal', '4 prize, 4 USB, UK/EU/US/AU, 10A.', 79.99, null, "travel", 24, false, 4.3, { Prize: "4" }],
  ['Pahar termic 500ml', 'Inox, dublu perete, 12h cald/rece.', 69.99, null, "travel", 20, false, 4.3, { Material: "Inox", Volum: "500ml" }],
  ['Saltea camping auto-umflabilă', '190x70x10cm, velur, pompă inclusă.', 249.99, null, "travel", 14, false, 4.2, { Dimensiuni: "190x70x10cm" }],
  ['Set căni camping 4 buc', 'Metal, 300ml, pliabile, carabinieră.', 59.99, null, "travel", 22, false, 4.1, { Cantitate: "4" }],
  ['Geantă laptop 15.6\"', 'Geantă umăr, compartiment laptop, hidrofug.', 149.99, null, "travel", 20, false, 4.2, { Material: "Poliester" }],
  ['Mască somn premium', 'Mătase 100%, reglabilă, antifon.', 49.99, null, "travel", 26, false, 4.1, { Material: "Mătase" }],
  ['Set bagaje 3 buc (cabină+medie+mare)', '3 buc: cabină, 65L, 80L, ABS, TSA.', 999.99, 1199.99, "travel", 10, true, 4.3, { Piese: "3" }],
  ['Husă pașaport piele', 'Piele naturală, 2 buzunare, 13.5x9cm.', 59.99, null, "travel", 28, false, 4.2, { Material: "Piele" }],
  ['Perie dinți călătorie pliabilă', 'Pliabilă, bambus, pastă dinți 30g, husă.', 29.99, null, "travel", 30, false, 4.0, { Material: "Bambus" }],
  ['Set recipiente TSA 100ml 6buc', '6 recipiente 100ml, silicon, husă transparentă.', 39.99, null, "travel", 26, false, 4.2, { Cantitate: "6" }],
  ['Organizator bagaj 5 set', '5 piese, nailon, compresie, diverse dimensiuni.', 69.99, null, "travel", 24, false, 4.2, { Piese: "5" }],
  ['Lanternă LED camping', 'LED 1000lm, 200m, 8h, USB-C, impermeabilă.', 149.99, null, "travel", 20, false, 4.3, { Luminozitate: "1000lm" }],
  ['Târg complet drumeție', 'Baston telescopic 2 buc, lanternă, busolă.', 199.99, null, "travel", 14, false, 4.1, { Piese: "2 bastoane + lanternă + busolă" }],
  ['Husă bagaj elastică', 'Elastică, universală, XXL, 4 culori.', 49.99, null, "travel", 28, false, 4.0, { Dimensiune: "Universală" }],
  ['Kit prim ajutor travel 20piese', '20 piese, geantă textilă, compact.', 39.99, null, "travel", 24, false, 4.1, { Piese: "20" }],
  ['Mac de ploaie de unică folosință 10buc', '10 buc, PVC, universal, husă.', 29.99, null, "travel", 30, false, 4.0, { Cantitate: "10" }],
]
products.push(...travel)

// Category 24: Auto (20)
const auto = [
  ['Anvelope iarna 205/55 R16', 'Continental WinterContact, 205/55 R16, 91H.', 399.99, null, "auto", 24, false, 4.5, { Brand: "Continental", Dimensiune: "205/55 R16" }],
  ['Anvelope vara 225/45 R17', 'Michelin Pilot Sport 4, 225/45 R17, 94Y.', 649.99, null, "auto", 14, false, 4.6, { Brand: "Michelin", Dimensiune: "225/45 R17" }],
  ['Ulei motor Mobil 1 5W30 4L', 'Mobil 1 5W30, sintetic, API SP, 4L.', 179.99, null, "auto", 18, false, 4.4, { Brand: "Mobil", Viscozitate: "5W30" }],
  ['Baterie Varta 60Ah', 'Varta 60Ah, 540A, start-stop, garanție 3 ani.', 499.99, null, "auto", 12, false, 4.4, { Brand: "Varta" }],
  ['Set becuri LED H7', 'LED H7, 6000K, 12000lm, ventilator, plug&play.', 149.99, null, "auto", 24, false, 4.2, { Tip: "H7" }],
  ['Lichid parbriz Sonax 1L', 'Sonax concentrat, -20°C, parfum proaspăt.', 19.99, null, "auto", 26, false, 4.1, { Brand: "Sonax" }],
  ['Cauciucuri iarna 195/65 R15', 'Nokian, 195/65 R15, 91T, lameloare.', 349.99, null, "auto", 22, false, 4.4, { Brand: "Nokian", Dimensiune: "195/65 R15" }],
  ['Suport GPS parbriz', 'Universal, vacuum, 360°.', 49.99, null, "auto", 28, false, 4.1, { Tip: "Parbriz" }],
  ['Covorașe auto cauciuc 4buc', 'Cauciuc, universale, lavabile, 4 buc.', 89.99, null, "auto", 22, false, 4.1, { Cantitate: "4" }],
  ['Lampă LED spate universală', '12-24V, roșu, 20 LED, etanșă.', 39.99, null, "auto", 16, false, 4.0, { Culoare: "Roșu" }],
  ['Kit prim ajutor auto 45piese', 'Geantă textilă, 45 piese, omologat.', 59.99, null, "auto", 18, false, 4.2, { Piese: "45" }],
  ['Triunghi reflectorizant', 'Pliabil, omologat, carcasă plastic.', 19.99, null, "auto", 24, false, 4.0, { Omologare: "Da" }],
  ['Stingător auto 1kg', 'Praf ABC, 1kg, suport, omologat.', 49.99, null, "auto", 22, false, 4.1, { Capacitate: "1kg" }],
  ['Perie + racletă parbriz', 'Telescopică 1m, mâner cauciuc.', 34.99, null, "auto", 26, false, 4.0, { Lungime: "1m" }],
  ['Încărcător baterie smart', '6A, 12V, desulfatare, recondiționare.', 199.99, null, "auto", 22, false, 4.3, { Curent: "6A" }],
  ['Antiglonț 1L', 'Antiglonț -25°C, 1L, gata de utilizare.', 24.99, null, "auto", 28, false, 4.1, { Volum: "1L" }],
  ['Set chei auto 12 buc', 'Chei tubular, bujii, inbus, Torx, carcasă.', 129.99, null, "auto", 20, false, 4.2, { Cantitate: "12" }],
  ['Cric auto hidraulic 2t', 'Hidraulic 2 tone, 135-385mm, suport.', 199.99, null, "auto", 16, false, 4.2, { Capacitate: "2t" }],
  ['Set căști auto Bluetooth', 'Bluetooth 5.3, 20h, 2 buc, încărcare USB-C.', 299.99, null, "auto", 18, false, 4.1, { Autonomie: "20h" }],
  ['Parfum auto Ambi-Pur', 'Ambi-Pur, 8g, prospețime, 60 zile.', 19.99, null, "auto", 30, false, 4.0, { Brand: "Ambi-Pur" }],
]
products.push(...auto)

// Category 25: Moto (20)
const moto = [
  ['Cască integrală HJC', 'HJC, policarbonat, vizor fumuriu, ECE 22.06.', 799.99, null, "moto", 18, false, 4.4, { Brand: "HJC" }],
  ['Mănuși moto iarna Alpinestars', 'Alpinestars, căptușeală termică, ecran tactil.', 349.99, null, "moto", 20, false, 4.3, { Brand: "Alpinestars" }],
  ['Cască modulară Shark', 'Shark, vizor dublu, pinlock, carbon.', 1499.99, 1799.99, "moto", 8, true, 4.5, { Brand: "Shark", Material: "Carbon" }],
  ['Geacă moto textilă Alpinestars', 'Alpinestars, impermeabilă, protectii nivel 2.', 1199.99, 1399.99, "moto", 22, true, 4.4, { Brand: "Alpinestars" }],
  ['Topcase moto 45L', 'Aluminiu, 45L, sistem rapid, încuietoare centrală.', 599.99, null, "moto", 18, false, 4.3, { Material: "Aluminiu" }],
  ['Blugi moto cu protectii', 'Denim, protectii genunchi+șold, nivel 1.', 599.99, null, "moto", 16, false, 4.2, { Material: "Denim" }],
  ['Cizme moto Alpinestars', 'Alpinestars SMX-6, piele, protectii gleznă.', 999.99, 1199.99, "moto", 12, true, 4.4, { Brand: "Alpinestars" }],
  ['Cască jet LS2', 'LS2 Jet, poliuretan, vizor trasat, certificat.', 349.99, null, "moto", 22, false, 4.1, { Brand: "LS2" }],
  ['Mănuși moto vară Alpinestars', 'Alpinestars SP-8, piele, perforate.', 299.99, null, "moto", 20, false, 4.2, { Brand: "Alpinestars" }],
  ['Suport telefon ghidon', 'Universal, 4 brațe, 360°, etanș IPX8.', 99.99, null, "moto", 26, false, 4.1, { Tip: "Ghidon" }],
  ['Cască off-road Fox Racing', 'Fox Racing, MIPS, vizor lung, sistem ajustabil.', 899.99, null, "moto", 10, false, 4.3, { Brand: "Fox Racing" }],
  ['Proiector LED moto 4\"', '4", 3000lm, 12V, etanș, 2 buc.', 149.99, null, "moto", 22, false, 4.2, { Luminozitate: "3000lm" }],
  ['Set semnalizări LED moto', 'LED, dublu, roșu-ștralucitor, 12V, 2 buc.', 79.99, null, "moto", 24, false, 4.0, { Tip: "LED" }],
  ['Geantă rezervor 8L', 'Magnetică, 8L, impermeabilă, husă ploaie.', 199.99, null, "moto", 18, false, 4.1, { Capacitate: "8L" }],
  ['Suport cască moto', 'Metal, prindere sub scaun, anti-furt.', 69.99, null, "moto", 26, false, 4.0, { Material: "Metal" }],
  ['Colant moto cu protectii nivel 2', 'Denim elastic, protectii genunchi, CE nivel 2.', 799.99, null, "moto", 12, true, 4.3, { Protectii: "Nivel 2" }],
  ['Geacă moto vară mesh', 'Mesh, protectii cot+umăr, ventilată.', 799.99, 949.99, "moto", 16, true, 4.2, { Material: "Mesh" }],
  ['Închizătoare disc moto', 'Disc brake lock, alarmă 120dB, roșu.', 149.99, null, "moto", 22, false, 4.1, { Alarmă: "120dB" }],
  ['Set chei moto tubular', 'Chei tubular 8-24mm, carcasă, oțel CrV.', 99.99, null, "moto", 24, false, 4.0, { Material: "Oțel CrV" }],
  ['Geantă spate moto 30L', '30L, impermeabilă, roll-top, prindere rapidă.', 299.99, null, "moto", 16, false, 4.2, { Capacitate: "30L" }],
]
products.push(...moto)

// Category 26: RCA (20)
const rca = [
  ['Kit prim ajutor 45 piese omologat', 'Geantă textilă, 45 piese, omologat RAR.', 59.99, null, "rca", 20, false, 4.2, { Piese: "45" }],
  ['Triunghi reflectorizant 2 buc', 'Pliabil, omologat, 2 buc.', 34.99, null, "rca", 24, false, 4.0, { Cantitate: "2" }],
  ['Stingător auto 1kg omologat', 'Praf ABC, 1kg, suport metalic.', 49.99, null, "rca", 22, false, 4.1, { Capacitate: "1kg" }],
  ['Trusă medicală completă auto', 'Trusă 50 piese, garou, fașă, mănuși, foarfece.', 79.99, null, "rca", 18, false, 4.2, { Piese: "50" }],
  ['Extinctor auto 2kg', 'Praf ABC, 2kg, suport, manometru.', 79.99, null, "rca", 16, false, 4.1, { Capacitate: "2kg" }],
  ['Trusă de prim ajutor 12 piese', 'Geantă compactă, 12 piese, portabil.', 29.99, null, "rca", 28, false, 4.0, { Piese: "12" }],
  ['Vestă reflectorizantă 3 buc', 'Fluorescentă, 3 buc, omologată.', 29.99, null, "rca", 30, false, 4.1, { Cantitate: "3" }],
  ['Baterie externă auto 10000mAh', '10.000mAh, USB-C, pornire motor 3.0L.', 299.99, null, "rca", 14, false, 4.3, { Capacitate: "10000mAh" }],
  ['Trusă scule auto 15 buc', 'Chei, șurubelnițe, clește, role, carcasă.', 129.99, null, "rca", 20, false, 4.1, { Piese: "15" }],
  ['Cabluri baterie 2.5m', '2.5m, secțiune 16mm², clești izolați.', 69.99, null, "rca", 22, false, 4.2, { Lungime: "2.5m" }],
  ['Lampă de avarie LED', 'LED, 12V, portabil, baterie 4h, magnetic.', 49.99, null, "rca", 24, false, 4.1, { Autonomie: "4h" }],
  ['Trusă prim ajutor perete 20 piese', 'Cutie metalică, 20 piese, montare perete.', 59.99, null, "rca", 18, false, 4.1, { Piese: "20" }],
  ['Giulgiu de apă 500ml', 'Soluție spălare ochi, 500ml, 2 ani garanție.', 39.99, null, "rca", 22, false, 4.0, { Volum: "500ml" }],
  ['Trusă supraviețuire 7 în 1', '7 funcții: lanternă, fluier, busolă, foc.', 49.99, null, "rca", 20, false, 4.2, { Funcții: "7" }],
  ['Compresor auto 12V', '12V, 150PSI, manometru, LED, 5m cablu.', 149.99, null, "rca", 18, false, 4.2, { Presiune: "150PSI" }],
  ['Trusă izolare bandă', 'Bandă izolare neagră 3m, 3 role + bandă PVC.', 19.99, null, "rca", 30, false, 4.0, { Role: "4" }],
  ['Suport triunghi auto', 'Triunghi + suport cauciuc, stabil.', 39.99, null, "rca", 26, false, 4.0, { Tip: "Triunghi + suport" }],
  ['Trusă de urgență ruptură', 'Bandaj 10cm, compresă, mănuși, foarfece, ace.', 29.99, null, "rca", 24, false, 4.1, { Piese: "8" }],
  ['Trusă consumabile auto', 'Bandă izolare, sârmă, cablu, spray, 15 buc.', 49.99, null, "rca", 22, false, 4.0, { Piese: "15" }],
  ['Manual prim ajutor auto', 'Carte 100 pagini, ghid intervenție, cu imagini.', 19.99, null, "rca", 30, false, 4.1, { Pagini: "100" }],
]
products.push(...rca)

// Category 27: Jucării (20)
const juc = [
  ['LEGO Technic Porsche 911', 'LEGO Technic, 1500 piese, 6+, cutie premium.', 599.99, 699.99, "jucarii", 16, true, 4.7, { Brand: "LEGO", Piese: "1500" }],
  ['LEGO City Pompieri', 'LEGO City Stație Pompieri, 800 piese, 5+, figurine.', 349.99, 399.99, "jucarii", 18, true, 4.5, { Brand: "LEGO", Piese: "800" }],
  ['Păpușă Barbie Dreamhouse', 'Barbie Dreamhouse, 3 etaje, 10 camere, 30 accesorii.', 799.99, 899.99, "jucarii", 8, true, 4.4, { Brand: "Barbie" }],
  ['Mașină RC Offroad 4x4', 'RC 4x4, 30km/h, 2.4GHz, Li-Po 7.4V.', 299.99, null, "jucarii", 22, false, 4.3, { Viteza: "30km/h" }],
  ['Dronă cameră 1080p', 'Quadcopter, HD 1080p, 20min, mod fără GPS.', 399.99, null, "jucarii", 24, false, 4.2, { Cameră: "1080p" }],
  ['Set șevalet pictură', 'Lemn, tablă magnetică+cretă, 50x60cm, accesorii.', 149.99, null, "jucarii", 16, false, 4.3, { Material: "Lemn" }],
  ['Monopoly clasic', 'Monopoly, 2-8 jucători, 6+, bancă electronică.', 149.99, null, "jucarii", 18, false, 4.5, { Jucători: "2-8" }],
  ['Catan joc strategie', 'Settlers of Catan, 3-4 jucători, 10+, interschimbabil.', 199.99, null, "jucarii", 22, false, 4.7, { Jucători: "3-4" }],
  ['Puzzle 1000 piese peisaj', '1000 piese, 68x48cm, cutie premium.', 79.99, null, "jucarii", 18, false, 4.3, { Piese: "1000" }],
  ['Set poker profesionist', '500 jetoane, 2 pachete cărți, masă pliabilă.', 299.99, null, "jucarii", 12, false, 4.2, { Jetoane: "500" }],
  ['Thomas Locomotiva set tren', 'Thomas, 15 piese, șine, locomotivă+vagoane, 3+.', 249.99, null, "jucarii", 16, false, 4.3, { Piese: "15" }],
  ['LEGO Star Wars Tie Fighter', 'LEGO Star Wars, 700 piese, 8+, figurine.', 449.99, 499.99, "jucarii", 14, true, 4.6, { Brand: "LEGO", Seria: "Star Wars" }],
  ['Set cărți educaționale 3+', '10 cărți, animale, litere, numere, figuri.', 59.99, null, "jucarii", 20, false, 4.4, { Cărți: "10" }],
  ['Joc UNO clasic', 'UNO, 2-10 jucători, 7+, 112 cărți.', 49.99, null, "jucarii", 28, false, 4.5, { Jucători: "2-10" }],
  ['Tren electric Hornby set', 'Hornby, locomotivă+3 vagoane, șine oval, 6+.', 599.99, 699.99, "jucarii", 10, true, 4.3, { Brand: "Hornby" }],
  ['Pistol cu apă Super Soaker', 'Super Soaker, 1.5L, 10m distanță.', 79.99, null, "jucarii", 26, false, 4.2, { Capacitate: "1.5L" }],
  ['Set figurine animale 15 buc', 'PVC, 5-10cm, 15 animale sălbatice.', 89.99, null, "jucarii", 24, false, 4.2, { Cantitate: "15" }],
  ['Joc Scrabble', 'Scrabble, 2-4 jucători, 10+, 100 piese litere.', 99.99, null, "jucarii", 20, false, 4.4, { Jucători: "2-4" }],
  ['Rachetă spacială LEGO', 'LEGO City Rachetă, 500 piese, 5+.', 299.99, null, "jucarii", 16, false, 4.3, { Brand: "LEGO", Piese: "500" }],
  ['Set instrumente muzicale copii', 'Xilofon, tamburină, maracas, 6 instrumente.', 129.99, null, "jucarii", 22, false, 4.2, { Piese: "6" }],
]
products.push(...juc)

// Category 28: Copii (20)
const cop = [
  ['Cărucior Chicco 3 în 1', 'Chicco, cadru pliabil, husă ploaie, coș.', 1299.99, 1499.99, "copii", 18, true, 4.5, { Brand: "Chicco" }],
  ['Scăunel auto Chicco 9-36kg', 'Chicco, grupa 1-2-3, 9-36kg, Isofix, ECE R44/04.', 699.99, null, "copii", 24, false, 4.4, { Brand: "Chicco", Greutate: "9-36kg" }],
  ['Pătuț transformabil lemn', '120x60cm, transformabil pat+balansoar, lemn masiv.', 899.99, 1099.99, "copii", 22, true, 4.3, { Material: "Lemn masiv" }],
  ['Comodă + schimbător bebe', 'Lemn masiv, 3 sertare, schimbător integrat.', 749.99, null, "copii", 14, false, 4.2, { Material: "Lemn masiv" }],
  ['Set hăinuțe bebe 0-3 luni 5piese', 'Body, salopetă, șosetute, bonetă, bumbac organic.', 129.99, null, "copii", 20, false, 4.3, { Material: "Bumbac organic" }],
  ['Jucărie sonoră+ lumini', 'Interactivă, sunete, lumini, 6+ luni, senzorială.', 89.99, null, "copii", 22, false, 4.2, { Varsta: "6+ luni" }],
  ['Set cărți educaționale 3+', '10 cărți, animale, litere, numere.', 59.99, null, "copii", 16, false, 4.4, { Cărți: "10" }],
  ['Trotinetă copii 3 roți', '3 roți, ajustabilă înălțime, 2-6 ani.', 179.99, null, "copii", 24, false, 4.3, { Varsta: "2-6 ani" }],
  ['Set de creioane colorate 48', '48 buc, triunghiulare, non-toxice, cutie metal.', 49.99, null, "copii", 26, false, 4.2, { Cantitate: "48" }],
  ['Pat etajat copii lemn', 'Lemn masiv, pat 2 etaje, 190x90cm, scară+protecție.', 1999.99, 2399.99, "copii", 10, true, 4.3, { Material: "Lemn masiv" }],
  ['Birou copii ajustabil', 'Ajustabil înălțime, 80x50cm, 3 sertare, lemn.', 599.99, null, "copii", 16, false, 4.2, { Dimensiuni: "80x50cm" }],
  ['Scaun birou copii ergonomic', 'Scaun ergonomic, ajustabil, roți, suport lombar.', 399.99, null, "copii", 18, false, 4.1, { Material: "Plastic" }],
  ['Costum baie copii 2-8 ani', 'Costum baie, UV 50+, uscare rapidă, 2-8 ani.', 79.99, null, "copii", 22, false, 4.2, { "Protecție UV": "50+" }],
  ['Set curățenie orală copii', 'Periuță + pastă 50ml + cană, 3+.', 39.99, null, "copii", 26, false, 4.1, { Piese: "3" }],
  ['Lanternă proiector story', 'Lanternă, 8 diapozitive, povești, 3+.', 59.99, null, "copii", 24, false, 4.2, { Diapozitive: "8" }],
  ['Set păpuși 4 buc', 'Păpuși 20cm, 4 buc, îmbrăcăminte detașabilă.', 99.99, null, "copii", 22, false, 4.2, { Cantitate: "4" }],
  ['Joc amuzant Twister', 'Twister, 2-4 jucători, 6+.', 89.99, null, "copii", 24, false, 4.3, { Jucători: "2-4" }],
  ['Set caiete activități 10buc', '10 caiete, 50 pagini, diverse activități 4+.', 39.99, null, "copii", 28, false, 4.0, { Caiete: "10" }],
  ['Saltea joacă puzzle', 'Puzzle 60x60x1cm, EVA, 4 plăci, culori.', 69.99, null, "copii", 24, false, 4.1, { Material: "EVA" }],
  ['Set trusă școlară 20 piese', 'Creioane, pixuri, carioci, radieră, ascuțitoare.', 49.99, null, "copii", 26, false, 4.1, { Piese: "20" }],
]
products.push(...cop)

// Category 29: Bebe (20)
const bebe = [
  ['Set creioane colorate 48 buc', 'Triunghiulare, non-toxice, cutie metal.', 49.99, null, "bebe", 22, false, 4.2, { Cantitate: "48" }],
  ['Body bebe bumbac organic 6buc', '6 body, bumbac organic, mărimi 0-24 luni.', 99.99, null, "bebe", 26, false, 4.3, { Cantitate: "6" }],
  ['Saltea patuț bebe 120x60', 'Saltea memorie, 120x60x10cm, husă lavabilă.', 199.99, null, "bebe", 18, false, 4.3, { Material: "Memory foam" }],
  ['Set prosop bebe 4 buc', 'Bumbac organic, 70x70cm, glugă, 4 buc.', 89.99, null, "bebe", 24, false, 4.2, { Material: "Bumbac organic" }],
  ['Șervețele umede bebe 5x80', '5 pachete x 80, fără alcool, hipoalergenice.', 49.99, null, "bebe", 30, false, 4.3, { Pachete: "5" }],
  ['Scutec bebe 120 buc', 'Mărime 3 (4-9kg), 120 buc, ultra-absorbant.', 89.99, null, "bebe", 28, false, 4.3, { Mărime: "3 (4-9kg)" }],
  ['Set biberon Philips Avent 3buc', '3 buc, 260ml, anti-colici, silicon.', 149.99, null, "bebe", 24, false, 4.4, { Brand: "Philips Avent" }],
  ['Sonică suzetă Philips Avent 2buc', '2 suzete, silicon, 0-6 luni, sterilizare.', 39.99, null, "bebe", 28, false, 4.2, { Brand: "Philips Avent" }],
  ['Balansoar electric bebe', 'Electric, 5 viteze, 10 melodii, 0-9kg.', 349.99, 399.99, "bebe", 14, true, 4.3, { "Greutate max": "9kg" }],
  ['Mobilă bebe 3 piese (pat+comodă+birou)', 'Lemn masiv, alb, set complet cameră bebe.', 2999.99, 3499.99, "bebe", 6, true, 4.3, { Material: "Lemn masiv" }],
  ['Trotinetă bebe 3 roți', '3 roți, 1-4 ani, înălțime ajustabilă.', 129.99, null, "bebe", 22, false, 4.2, { Varsta: "1-4 ani" }],
  ['Interfon bebe video', 'Video, ecran 3.5\", noapte, 300m rază.', 299.99, null, "bebe", 16, false, 4.2, { Rază: "300m" }],
  ['Jucărie de pluș 30cm', 'Ursuleț 30cm, pluș moale, lavabil.', 49.99, null, "bebe", 28, false, 4.3, { Material: "Pluș" }],
  ['Masă de activități bebe', 'Lemn, 4 activități, sunete, lumini, 6+ luni.', 199.99, null, "bebe", 16, false, 4.2, { Activități: "4" }],
  ['Set veselă bebe 5 piese', 'Bol, farfurie, cană, tacâmuri, silicon.', 79.99, null, "bebe", 24, false, 4.1, { Piese: "5" }],
  ['Covoare joacă 100x150cm', 'PVC, culori, cifre, litere, 10mm grosime.', 99.99, null, "bebe", 20, false, 4.1, { Dimensiuni: "100x150cm" }],
  ['Scăunel bebe masă', 'Scăunel înalt, lemn, centură siguranță, 0-3 ani.', 349.99, null, "bebe", 18, false, 4.3, { Material: "Lemn" }],
  ['Set pijama bebe 3 buc', 'Bumbac organic, 0-12 luni, 3 seturi.', 79.99, null, "bebe", 24, false, 4.2, { Material: "Bumbac organic" }],
  ['Cos bebe lenjerie 5 piese', 'Cearcaf, pilotă, pernă, 2 fețe pernă, 100% bumbac.', 149.99, null, "bebe", 18, false, 4.2, { Piese: "5" }],
  ['Lampă de veghe bebe LED', 'LED, 7 culori, telecomandă, 30min-8h.', 69.99, null, "bebe", 26, false, 4.2, { Culori: "7" }],
]
products.push(...bebe)

async function main() {
  console.log(`Total products to insert: ${products.length}`)

  const { rows: cats } = await pool.query("SELECT id, slug FROM categories")
  const catMap = new Map(cats.map((c) => [c.slug, c.id]))

  const missing = new Set(products.map((p) => p[4]))
  for (const slug of catMap.keys()) missing.delete(slug)
  if (missing.size > 0) {
    console.error(`Unknown categories: ${[...missing].join(", ")}`)
    process.exit(1)
  }

  const query = sql(products, catMap)

  const BATCH = 100
  const statements = []
  const rows = query.split(";\n").filter(Boolean)
  for (let i = 0; i < rows.length; i += BATCH) {
    statements.push(rows.slice(i, i + BATCH).join(";\n") + ";")
  }

  for (let i = 0; i < statements.length; i++) {
    console.log(`Inserting batch ${i + 1}/${statements.length}...`)
    await pool.query(statements[i])
  }

  console.log("Done! All products inserted.")
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
