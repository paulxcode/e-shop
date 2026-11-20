import pg from "pg"

const { Client } = pg

const client = new Client({
  host: "db.lpqizrwfnkbonxsqffaw.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

const users = [
  { email: "andrei.popescu@gmail.com", full_name: "Andrei Popescu", phone: "0721000001", city: "București", county: "Ilfov", zip: "010101", role: "admin", createdAt: "2025-01-15T10:30:00Z" },
  { email: "ioana.ionescu@yahoo.com", full_name: "Ioana Ionescu", phone: "0722000002", city: "Cluj-Napoca", county: "Cluj", zip: "400000", role: "customer", createdAt: "2025-01-22T14:15:00Z" },
  { email: "mihai.dumitru@gmail.com", full_name: "Mihai Dumitru", phone: "0723000003", city: "Timișoara", county: "Timiș", zip: "300001", role: "customer", createdAt: "2025-02-05T09:00:00Z" },
  { email: "elena.stan@hotmail.com", full_name: "Elena Stan", phone: "0724000004", city: "Iași", county: "Iași", zip: "700000", role: "customer", createdAt: "2025-02-14T16:45:00Z" },
  { email: "cristian.matei@gmail.com", full_name: "Cristian Matei", phone: "0725000005", city: "Brașov", county: "Brașov", zip: "500001", role: "customer", createdAt: "2025-03-01T08:20:00Z" },
  { email: "diana.neagu@yahoo.com", full_name: "Diana Neagu", phone: "0726000006", city: "Constanța", county: "Constanța", zip: "900000", role: "customer", createdAt: "2025-03-10T12:00:00Z" },
  { email: "alexandru.georgescu@gmail.com", full_name: "Alexandru Georgescu", phone: "0727000007", city: "Craiova", county: "Dolj", zip: "200001", role: "admin", createdAt: "2025-03-18T11:30:00Z" },
  { email: "gabriela.marin@outlook.com", full_name: "Gabriela Marin", phone: "0728000008", city: "Galați", county: "Galați", zip: "800000", role: "customer", createdAt: "2025-04-02T15:10:00Z" },
  { email: "radu.serban@gmail.com", full_name: "Radu Șerban", phone: "0729000009", city: "Ploiești", county: "Prahova", zip: "100001", role: "customer", createdAt: "2025-04-11T09:45:00Z" },
  { email: "anca.toma@yahoo.com", full_name: "Anca Toma", phone: "0730000010", city: "Oradea", county: "Bihor", zip: "410000", role: "customer", createdAt: "2025-04-28T13:20:00Z" },
  { email: "bogdan.gheorghe@gmail.com", full_name: "Bogdan Gheorghe", phone: "0731000011", city: "Brăila", county: "Brăila", zip: "810000", role: "customer", createdAt: "2025-05-05T10:00:00Z" },
  { email: "simona.radulescu@gmail.com", full_name: "Simona Rădulescu", phone: "0732000012", city: "Arad", county: "Arad", zip: "310000", role: "customer", createdAt: "2025-05-19T16:30:00Z" },
  { email: "valentin.pavel@hotmail.com", full_name: "Valentin Pavel", phone: "0733000013", city: "Sibiu", county: "Sibiu", zip: "550000", role: "customer", createdAt: "2025-06-02T08:15:00Z" },
  { email: "corina.voicu@yahoo.com", full_name: "Corina Voicu", phone: "0734000014", city: "Bacău", county: "Bacău", zip: "600000", role: "customer", createdAt: "2025-06-15T14:00:00Z" },
  { email: "dragos.iancu@gmail.com", full_name: "Dragoș Iancu", phone: "0735000015", city: "Târgu Mureș", county: "Mureș", zip: "540000", role: "customer", createdAt: "2025-06-28T11:45:00Z" },
  { email: "loredana.barbu@gmail.com", full_name: "Loredana Barbu", phone: "0736000016", city: "Pitești", county: "Argeș", zip: "110000", role: "customer", createdAt: "2025-07-07T09:30:00Z" },
  { email: "cosmin.dobre@outlook.com", full_name: "Cosmin Dobre", phone: "0737000017", city: "Buzău", county: "Buzău", zip: "120000", role: "customer", createdAt: "2025-07-21T15:20:00Z" },
  { email: "maria.lupu@yahoo.com", full_name: "Maria Lupu", phone: "0738000018", city: "Suceava", county: "Suceava", zip: "720000", role: "customer", createdAt: "2025-08-03T10:00:00Z" },
  { email: "octavian.nistor@gmail.com", full_name: "Octavian Nistor", phone: "0739000019", city: "Botoșani", county: "Botoșani", zip: "710000", role: "customer", createdAt: "2025-08-18T13:50:00Z" },
  { email: "alina.costache@hotmail.com", full_name: "Alina Costache", phone: "0740000020", city: "Focșani", county: "Vrancea", zip: "620000", role: "customer", createdAt: "2025-09-01T08:30:00Z" },
  { email: "florin.rusu@gmail.com", full_name: "Florin Rusu", phone: "0741000021", city: "Roman", county: "Neamț", zip: "611000", role: "customer", createdAt: "2025-09-14T16:00:00Z" },
  { email: "ramona.ungureanu@yahoo.com", full_name: "Ramona Ungureanu", phone: "0742000022", city: "Tulcea", county: "Tulcea", zip: "820000", role: "customer", createdAt: "2025-09-29T11:15:00Z" },
  { email: "viorel.mocanu@gmail.com", full_name: "Viorel Mocanu", phone: "0743000023", city: "Deva", county: "Hunedoara", zip: "330000", role: "customer", createdAt: "2025-10-06T09:00:00Z" },
  { email: "camelia.tudor@outlook.com", full_name: "Camelia Tudor", phone: "0744000024", city: "Sfântu Gheorghe", county: "Covasna", zip: "520000", role: "customer", createdAt: "2025-10-20T14:30:00Z" },
  { email: "marius.stoian@gmail.com", full_name: "Marius Stoian", phone: "0745000025", city: "Slatina", county: "Olt", zip: "230000", role: "customer", createdAt: "2025-11-03T10:45:00Z" },
  { email: "daniela.olteanu@yahoo.com", full_name: "Daniela Olteanu", phone: "0746000026", city: "Reșița", county: "Caraș-Severin", zip: "320000", role: "customer", createdAt: "2025-11-17T08:20:00Z" },
  { email: "sebastian.dima@gmail.com", full_name: "Sebastian Dima", phone: "0747000027", city: "Râmnicu Vâlcea", county: "Vâlcea", zip: "240000", role: "customer", createdAt: "2025-12-01T15:00:00Z" },
  { email: "roxana.chivu@hotmail.com", full_name: "Roxana Chivu", phone: "0748000028", city: "Zalău", county: "Sălaj", zip: "450000", role: "customer", createdAt: "2025-12-12T11:30:00Z" },
  { email: "tiberiu.bota@gmail.com", full_name: "Tiberiu Boța", phone: "0749000029", city: "Baia Mare", county: "Maramureș", zip: "430000", role: "customer", createdAt: "2025-12-28T09:15:00Z" },
  { email: "ioana.cretu@yahoo.com", full_name: "Ioana Crețu", phone: "0750000030", city: "Satu Mare", county: "Satu Mare", zip: "440000", role: "customer", createdAt: "2026-01-08T14:00:00Z" },
  { email: "gheorghe.neacsu@gmail.com", full_name: "Gheorghe Neacșu", phone: "0751000031", city: "Drobeta-Turnu Severin", county: "Mehedinți", zip: "220000", role: "customer", createdAt: "2026-01-19T10:30:00Z" },
  { email: "monica.vlad@outlook.com", full_name: "Monica Vlad", phone: "0752000032", city: "Alexandria", county: "Teleorman", zip: "140000", role: "customer", createdAt: "2026-02-02T16:45:00Z" },
  { email: "adrian.petrescu@gmail.com", full_name: "Adrian Petrescu", phone: "0753000033", city: "Giurgiu", county: "Giurgiu", zip: "080000", role: "customer", createdAt: "2026-02-14T08:00:00Z" },
  { email: "catalina.manole@yahoo.com", full_name: "Cătălina Manole", phone: "0754000034", city: "Călărași", county: "Călărași", zip: "910000", role: "customer", createdAt: "2026-03-01T12:20:00Z" },
  { email: "emil.grigore@gmail.com", full_name: "Emil Grigore", phone: "0755000035", city: "Slobozia", county: "Ialomița", zip: "920000", role: "customer", createdAt: "2026-03-15T09:30:00Z" },
  { email: "stefania.enache@hotmail.com", full_name: "Ștefania Enache", phone: "0756000036", city: "Vaslui", county: "Vaslui", zip: "730000", role: "customer", createdAt: "2026-03-28T14:10:00Z" },
  { email: "laurentiu.cristea@gmail.com", full_name: "Laurențiu Cristea", phone: "0757000037", city: "Alba Iulia", county: "Alba", zip: "510000", role: "customer", createdAt: "2026-04-05T11:00:00Z" },
  { email: "bianca.draghici@yahoo.com", full_name: "Bianca Drăghici", phone: "0758000038", city: "Bistrița", county: "Bistrița-Năsăud", zip: "420000", role: "customer", createdAt: "2026-04-18T15:30:00Z" },
  { email: "nicu.soare@gmail.com", full_name: "Nicu Soare", phone: "0759000039", city: "Sighetu Marmației", county: "Maramureș", zip: "435000", role: "customer", createdAt: "2026-05-02T08:45:00Z" },
  { email: "paula.ciobanu@outlook.com", full_name: "Paula Ciobanu", phone: "0760000040", city: "Hunedoara", county: "Hunedoara", zip: "331000", role: "admin", createdAt: "2026-05-14T10:00:00Z" },
]

async function seed() {
  await client.connect()
  console.log("Connected to database")

  let inserted = 0

  for (const u of users) {
    try {
      await client.query(
        `INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, raw_app_meta_data, raw_user_meta_data, confirmation_sent_at, is_super_admin)
         VALUES (gen_random_uuid(), $1, crypt($2, gen_salt('bf', 10)), $3, $3, $3, 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, $3, false)
         RETURNING id`,
        [u.email, "parola123", u.createdAt]
      )

      const { rows } = await client.query(
        `SELECT id FROM auth.users WHERE email = $1`,
        [u.email]
      )

      if (rows.length === 0) {
        console.error(`  ✗ No id returned for ${u.email}`)
        continue
      }

      const id = rows[0].id

      await client.query(
        `INSERT INTO public.users (id, email, full_name, phone, address, role, created_at)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          id,
          u.email,
          u.full_name,
          u.phone,
          JSON.stringify({
            street: `Strada ${u.full_name.split(" ")[1]} nr. ${Math.floor(Math.random() * 100) + 1}`,
            city: u.city,
            county: u.county,
            zip: u.zip,
          }),
          u.role,
          u.createdAt,
        ]
      )

      inserted++
      console.log(`  ✓ ${u.email} (${u.full_name}) — ${u.role} — ${u.createdAt.slice(0, 10)}`)
    } catch (err) {
      console.error(`  ✗ ${u.email}: ${err.message}`)
    }
  }

  console.log(`\nDone. Inserted ${inserted} / ${users.length} users`)
  await client.end()
}

seed().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
