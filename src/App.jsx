/**
 * Vera's Kitchen, Guna — single-page site
 * Stack: React 18 + Tailwind CSS + lucide-react + @sanity/client
 *
 * Install:  npm i lucide-react @sanity/client
 * Tailwind: standard setup (content: ["./src/**\/*.{js,jsx}"])
 *
 * SANITY: set projectId below (or VITE_SANITY_PROJECT_ID). Until then the
 * mock data (same shape as Sanity documents) is used automatically.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@sanity/client";
import {
  Menu as MenuIcon, X, ShoppingBag, Plus, Minus, MapPin, Clock, Phone,
  CalendarDays, Users, Send, ChefHat, Trash2, Flame,
} from "lucide-react";

/* ───────────── Config ───────────── */
const WHATSAPP_NUMBER = "918717912832"; // TODO: restaurant number, country code first, no "+"
const PHONE_DISPLAY = "+91 8717912832"; // TODO
const ADDRESS = "Above UCO Bank, near Playotel, Choudharan Colony, Guna, Madhya Pradesh";
const MAP_SRC = "https://www.google.com/maps?q=Vera%27s+Kitchen+Guna&output=embed";

const sanity = createClient({
  projectId: import.meta.env?.VITE_SANITY_PROJECT_ID || "your-project-id",
  dataset: import.meta.env?.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

/* GROQ queries — match your Sanity schemas (menuItem, galleryImage) */
const MENU_QUERY = `*[_type == "menuItem"] | order(category asc, title asc){
  _id, title, price, category, description, isAvailable,
  "image": { "asset": { "url": image.asset->url } }
}`;
const GALLERY_QUERY = `*[_type == "galleryImage"] | order(_createdAt asc){
  _id, caption, "image": { "asset": { "url": image.asset->url } }
}`;

/* ───────────── Mock data (mirrors Sanity output) ───────────── */
// const u = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
// const MOCK_MENU = [
//   { _id: "m1", title: "Wood-Fired Margherita", price: 299, category: "Pizzas", description: "San Marzano-style sauce, fresh mozzarella, basil.", isAvailable: true, image: { asset: { url: u("photo-1574071318508-1cdbab80d002") } } },
//   { _id: "m2", title: "Peri-Peri Paneer Pizza", price: 349, category: "Pizzas", description: "Smoky peri-peri paneer, capsicum, onion, olives.", isAvailable: true, image: { asset: { url: u("photo-1513104890138-7c749659a591") } } },
//   { _id: "m3", title: "Four Cheese Pizza", price: 399, category: "Pizzas", description: "Mozzarella, cheddar, parmesan and processed cheese.", isAvailable: false, image: { asset: { url: u("photo-1548369937-47519962c11a") } } },
//   { _id: "m4", title: "Alfredo Penne", price: 279, category: "Pastas", description: "Creamy white sauce, garlic, herbs, parmesan.", isAvailable: true, image: { asset: { url: u("photo-1621996346565-e3dbc646d9a9") } } },
//   { _id: "m5", title: "Arrabbiata Spaghetti", price: 259, category: "Pastas", description: "Spicy tomato sauce, chilli flakes, olive oil.", isAvailable: true, image: { asset: { url: u("photo-1473093295043-cdd812d0e601") } } },
//   { _id: "m6", title: "Pink Sauce Fusilli", price: 289, category: "Pastas", description: "Tomato-cream blend with bell peppers and mushrooms.", isAvailable: true, image: { asset: { url: u("photo-1551183053-bf91a1d81141") } } },
//   { _id: "m7", title: "Royal Veg Thali", price: 249, category: "Thalis", description: "Two sabzis, dal, rice, roti, salad, raita and sweet.", isAvailable: true, image: { asset: { url: u("photo-1585937421612-70a008356fbe") } } },
//   { _id: "m8", title: "Paneer Special Thali", price: 299, category: "Thalis", description: "Paneer main, dal tadka, jeera rice, butter naan, gulab jamun.", isAvailable: true, image: { asset: { url: u("photo-1567188040759-fb8a883dc6d8") } } },
//   { _id: "m9", title: "Oreo Thick Shake", price: 149, category: "Shakes", description: "Cookies, vanilla ice cream, whole milk.", isAvailable: true, image: { asset: { url: u("photo-1572490122747-3968b75cc699") } } },
//   { _id: "m10", title: "Cold Coffee Frappe", price: 139, category: "Shakes", description: "Slow-brewed coffee blended with ice cream.", isAvailable: true, image: { asset: { url: u("photo-1461023058943-07fcbe16d735") } } },
//   { _id: "m11", title: "Mango Shake", price: 129, category: "Shakes", description: "Seasonal mango, chilled milk.", isAvailable: false, image: { asset: { url: u("photo-1553530666-ba11a7da3888") } } },
// ];
// const MOCK_GALLERY = [
//   { _id: "g1", caption: "Rooftop at dusk", image: { asset: { url: u("photo-1414235077428-338989a2e8c0", 900) } } },
//   { _id: "g2", caption: "Evening seating", image: { asset: { url: u("photo-1517248135467-4c7edcad34c4", 900) } } },
//   { _id: "g3", caption: "From the kitchen", image: { asset: { url: u("photo-1559339352-11d035aa65de", 900) } } },
//   { _id: "g4", caption: "Fresh from the oven", image: { asset: { url: u("photo-1555396273-367ea4eb4db5", 900) } } },
//   { _id: "g5", caption: "Lit up after dark", image: { asset: { url: u("photo-1552566626-52f8b828add9", 900) } } },
//   { _id: "g6", caption: "Table for two", image: { asset: { url: u("photo-1544148103-0773bf10d330", 900) } } },
// ];

// Unsplash image URL helper
const u = (photoId, width = 800) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;

// Mock Menu Data
const MOCK_MENU = [
  {
    _id: "m1",
    title: "Wood-Fired Margherita",
    price: 299,
    category: "Pizzas",
    description: "San Marzano-style sauce, fresh mozzarella, basil.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1574071318508-1cdbab80d002"),
      },
    },
  },
  {
    _id: "m2",
    title: "Peri-Peri Paneer Pizza",
    price: 349,
    category: "Pizzas",
    description: "Smoky peri-peri paneer, capsicum, onion, olives.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1513104890138-7c749659a591"),
      },
    },
  },
  {
    _id: "m3",
    title: "Four Cheese Pizza",
    price: 399,
    category: "Pizzas",
    description: "Mozzarella, cheddar, parmesan and processed cheese.",
    isAvailable: false,
    image: {
      asset: {
        url: u("photo-1548369937-47519962c11a"),
      },
    },
  },
  {
    _id: "m4",
    title: "Alfredo Penne",
    price: 279,
    category: "Pastas",
    description: "Creamy white sauce, garlic, herbs, parmesan.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1621996346565-e3dbc646d9a9"),
      },
    },
  },
  {
    _id: "m5",
    title: "Arrabbiata Spaghetti",
    price: 259,
    category: "Pastas",
    description: "Spicy tomato sauce, chilli flakes, olive oil.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1473093295043-cdd812d0e601"),
      },
    },
  },
  {
    _id: "m6",
    title: "Pink Sauce Fusilli",
    price: 289,
    category: "Pastas",
    description: "Tomato-cream blend with bell peppers and mushrooms.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1551183053-bf91a1d81141"),
      },
    },
  },
  {
    _id: "m7",
    title: "Royal Veg Thali",
    price: 249,
    category: "Thalis",
    description: "Two sabzis, dal, rice, roti, salad, raita and sweet.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1585937421612-70a008356fbe"),
      },
    },
  },
  {
    _id: "m8",
    title: "Paneer Special Thali",
    price: 299,
    category: "Thalis",
    description:
      "Paneer main, dal tadka, jeera rice, butter naan, gulab jamun.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1567188040759-fb8a883dc6d8"),
      },
    },
  },
  {
    _id: "m9",
    title: "Oreo Thick Shake",
    price: 149,
    category: "Shakes",
    description: "Cookies, vanilla ice cream, whole milk.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1572490122747-3968b75cc699"),
      },
    },
  },
  {
    _id: "m10",
    title: "Cold Coffee Frappe",
    price: 139,
    category: "Shakes",
    description: "Slow-brewed coffee blended with ice cream.",
    isAvailable: true,
    image: {
      asset: {
        url: u("photo-1461023058943-07fcbe16d735"),
      },
    },
  },
  {
    _id: "m11",
    title: "Mango Shake",
    price: 129,
    category: "Shakes",
    description: "Seasonal mango, chilled milk.",
    isAvailable: false,
    image: {
      asset: {
        url: u("photo-1553530666-ba11a7da3888"),
      },
    },
  },
];

// Mock Gallery Data
const MOCK_GALLERY = [
  {
    _id: "g1",
    caption: "Rooftop at dusk",
    image: {
      asset: {
        url: u("photo-1414235077428-338989a2e8c0", 900),
      },
    },
  },
  {
    _id: "g2",
    caption: "Evening seating",
    image: {
      asset: {
        url: u("photo-1517248135467-4c7edcad34c4", 900),
      },
    },
  },
  {
    _id: "g3",
    caption: "From the kitchen",
    image: {
      asset: {
        url: u("photo-1559339352-11d035aa65de", 900),
      },
    },
  },
  {
    _id: "g4",
    caption: "Fresh from the oven",
    image: {
      asset: {
        url: u("photo-1555396273-367ea4eb4db5", 900),
      },
    },
  },
  {
    _id: "g5",
    caption: "Lit up after dark",
    image: {
      asset: {
        url: u("photo-1552566626-52f8b828add9", 900),
      },
    },
  },
  {
    _id: "g6",
    caption: "Table for two",
    image: {
      asset: {
        url: u("photo-1544148103-0773bf10d330", 900),
      },
    },
  },
];

const CATEGORIES = ["Pizzas", "Pastas", "Thalis", "Shakes"];
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

/* ───────────── Hooks / helpers ───────────── */
function useSanity(query, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (sanity.config().projectId === "your-project-id") throw new Error("mock");
        const res = await sanity.fetch(query);
        if (live && Array.isArray(res) && res.length) setData(res);
      } catch {
        /* keep mock data */
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [query]);
  return { data, loading };
}

/* Scroll fade-in (Framer-Motion-style whileInView) without the dependency */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setShow(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
}

const Heading = ({ children, sub }) => (
  <div className="mb-10 max-w-2xl">
    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-tight">{children}</h2>
    {sub && <p className="mt-3 text-gray-400 leading-relaxed">{sub}</p>}
  </div>
);

const Section = ({ id, children, alt }) => (
  <section id={id} className={`scroll-mt-20 py-20 md:py-28 ${alt ? "bg-[#18202c]" : ""}`}>
    <div className="mx-auto max-w-6xl px-5">{children}</div>
  </section>
);

const goldBtn = "inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-semibold text-gray-900 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-50";
const ghostBtn = "inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/60 px-7 py-3 font-semibold text-amber-400 transition hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300";
const inputCls = "w-full rounded-lg border border-white/10 bg-[#1F2937] px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500";

/* ───────────── Navbar ───────────── */
const LINKS = [["About", "#about"], ["Menu", "#menu"], ["Gallery", "#gallery"], ["Book", "#book"], ["Contact", "#contact"]];

function Navbar({ cartCount, onCart }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 24);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid || open ? "bg-[#1F2937]/95 backdrop-blur border-b border-white/5" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="font-display text-2xl text-amber-400">Vera's Kitchen</a>
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map(([l, h]) => (
            <li key={h}><a href={h} className="text-sm text-gray-300 transition hover:text-amber-400">{l}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button onClick={onCart} aria-label="Open cart" className="relative rounded-full p-2 text-gray-200 hover:text-amber-400">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-xs font-bold text-gray-900">{cartCount}</span>}
          </button>
          <button className="rounded-full p-2 text-gray-200 md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </nav>
      <div className={`grid transition-all duration-300 md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <ul className="overflow-hidden px-5">
          {LINKS.map(([l, h]) => (
            <li key={h}><a href={h} onClick={() => setOpen(false)} className="block border-t border-white/5 py-4 text-gray-200">{l}</a></li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/* ───────────── Hero ───────────── */
function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#1F2937]">
      {/* Halka gold glow piche */}
      <div className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-28 md:grid-cols-2 md:gap-10">
        {/* Left: text */}
        <Reveal>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/40 px-4 py-1.5 text-sm text-amber-300">
            <ChefHat size={16} /> Run by IHM Mumbai alumni
          </p>
          <h1 className="font-display text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Guna's premium rooftop dining experience
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
            Wood-fired pizzas, slow-simmered pastas and full thalis, served under the open sky at Vera's Kitchen.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#menu" className={goldBtn}>View Menu</a>
            <a href="#book" className={ghostBtn}>Book a Table</a>
          </div>
        </Reveal>

        {/* Right: image */}
        <Reveal delay={200}>
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <img
              src={u("photo-1414235077428-338989a2e8c0", 1000)}
              alt="Vera's Kitchen rooftop dining"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl shadow-black/40"
            />
            {/* Gold border frame, thoda offset me */}
            <div className="pointer-events-none absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-3xl border border-amber-500/40" />
            {/* Chhota badge */}
            <div className="absolute -bottom-5 right-4 rounded-xl bg-amber-500 px-5 py-3 text-gray-900 shadow-xl">
              <p className="font-display text-lg leading-tight">Rooftop dining<br />in Guna</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────── About ───────────── */
function About() {
  return (
    <Section id="about" alt>
      <div className="grid items-center gap-12 md:grid-cols-2">
        <Reveal>
          <div className="relative">
            <img src={u("photo-1577219491135-ce391730fb2c", 900)} alt="Chef plating a dish" className="aspect-[4/5] w-full rounded-2xl object-cover" loading="lazy" />
            <div className="absolute -bottom-5 right-4 rounded-xl bg-amber-500 px-5 py-4 text-gray-900 shadow-xl">
              <p className="font-display text-xl leading-tight">Trained at<br />IHM Mumbai</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <Heading>Professional hospitality, on a Guna rooftop</Heading>
          <div className="space-y-4 leading-relaxed text-gray-300">
            <p>Vera's Kitchen was started by graduates of the Institute of Hotel Management, Mumbai, who brought big-city kitchen discipline and service standards back to Guna.</p>
            <p>The menu is cooked to order from fresh ingredients, and the open-air rooftop is lit and laid out for slow dinners, birthdays and small celebrations.</p>
          </div>
          <div className="mt-8 flex items-center gap-3 text-amber-400"><Flame size={20} /><span className="text-gray-200">Every order is prepared fresh, never reheated.</span></div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ───────────── Menu ───────────── */
function FoodCard({ item, qty, onAdd, onRemove }) {
  const out = !item.isAvailable;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#1F2937] transition duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={item.image?.asset?.url} alt={item.title} loading="lazy" className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${out ? "grayscale" : ""}`} />
        {out && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-amber-500/60 px-5 py-2 font-display text-lg text-amber-300">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-white">{item.title}</h3>
          <span className="font-semibold text-amber-400">{inr(item.price)}</span>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400">{item.description}</p>
        <div className="mt-5">
          {qty > 0 && !out ? (
            <div className="flex items-center justify-between rounded-full border border-amber-500/50 px-2 py-1">
              <button onClick={onRemove} aria-label={`Remove one ${item.title}`} className="rounded-full p-2 text-amber-400 hover:bg-amber-500/10"><Minus size={16} /></button>
              <span className="font-semibold text-white">{qty}</span>
              <button onClick={onAdd} aria-label={`Add one ${item.title}`} className="rounded-full p-2 text-amber-400 hover:bg-amber-500/10"><Plus size={16} /></button>
            </div>
          ) : (
            <button onClick={onAdd} disabled={out} className={`${goldBtn} w-full py-2.5`}>
              <Plus size={16} /> {out ? "Unavailable" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function MenuSection({ cart, add, remove }) {
  const { data: items, loading } = useSanity(MENU_QUERY, MOCK_MENU);
  const [tab, setTab] = useState(CATEGORIES[0]);
  const visible = items.filter((i) => i.category === tab);
  return (
    <Section id="menu">
      <Reveal>
        <Heading sub="Prices in INR. Items marked Out of Stock return as soon as the kitchen restocks.">Our menu</Heading>
      </Reveal>
      <div role="tablist" className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} role="tab" aria-selected={tab === c} onClick={() => setTab(c)}
            className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold transition ${tab === c ? "bg-amber-500 text-gray-900" : "border border-white/10 text-gray-300 hover:border-amber-500/50 hover:text-amber-400"}`}>
            {c}
          </button>
        ))}
      </div>
      {loading && <p className="text-gray-500">Loading menu…</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, i) => (
          <Reveal key={item._id} delay={i * 80}>
            <FoodCard item={item} qty={cart[item._id]?.qty || 0} onAdd={() => add(item)} onRemove={() => remove(item._id)} />
          </Reveal>
        ))}
      </div>
      {!loading && visible.length === 0 && <p className="text-gray-400">Nothing listed in {tab} right now.</p>}
    </Section>
  );
}

/* ───────────── Cart drawer + WhatsApp ───────────── */
function CartDrawer({ cart, open, setOpen, add, remove, clear, total, count }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [err, setErr] = useState("");
  const lines = Object.values(cart);

  const confirm = () => {
    if (!name.trim() || !address.trim()) return setErr("Enter your name and full delivery address to continue.");
    setErr("");
    const text = [
      "*New Order — Vera's Kitchen* 🍽️",
      "━━━━━━━━━━━━━━",
      ...lines.map(({ item, qty }, i) => `${i + 1}. ${item.title} × ${qty} = ${inr(item.price * qty)}`),
      "━━━━━━━━━━━━━━",
      `*Total: ${inr(total)}*`,
      "",
      "*Customer Details*",
      `👤 Name: ${name.trim()}`,
      `📍 Address: ${address.trim()}`,
      "",
      "Please confirm my order. Thank you!",
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <>
      {/* Sticky bottom bar */}
      {count > 0 && !open && (
        <button onClick={() => setOpen(true)} className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-xl items-center justify-between rounded-full bg-amber-500 px-6 py-4 font-semibold text-gray-900 shadow-2xl transition hover:bg-amber-400">
          <span className="flex items-center gap-2"><ShoppingBag size={20} /> {count} item{count > 1 ? "s" : ""}</span>
          <span>View cart · {inr(total)}</span>
        </button>
      )}
      {/* Overlay */}
      <div onClick={() => setOpen(false)} className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      {/* Drawer */}
      <aside role="dialog" aria-label="Your cart" aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] max-w-xl flex-col rounded-t-3xl border border-white/10 bg-[#1F2937] shadow-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="font-display text-2xl text-white">Your order</h3>
          <div className="flex items-center gap-1">
            {lines.length > 0 && <button onClick={clear} aria-label="Clear cart" className="rounded-full p-2 text-gray-400 hover:text-red-400"><Trash2 size={18} /></button>}
            <button onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-full p-2 text-gray-300 hover:text-white"><X size={22} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className="py-10 text-center text-gray-400">Your cart is empty. Add dishes from the menu.</p>
          ) : (
            <>
              <ul className="divide-y divide-white/5">
                {lines.map(({ item, qty }) => (
                  <li key={item._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-white">{item.title}</p>
                      <p className="text-sm text-gray-400">{inr(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 px-1">
                      <button onClick={() => remove(item._id)} aria-label="Decrease" className="p-1.5 text-amber-400"><Minus size={14} /></button>
                      <span className="w-5 text-center text-white">{qty}</span>
                      <button onClick={() => add(item)} aria-label="Increase" className="p-1.5 text-amber-400"><Plus size={14} /></button>
                    </div>
                    <span className="w-16 text-right font-semibold text-amber-400">{inr(item.price * qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-3">
                <input className={inputCls} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                <textarea className={inputCls} rows={3} placeholder="Full delivery address with landmark" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
                {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
              </div>
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="border-t border-white/10 px-6 py-4">
            <div className="mb-3 flex justify-between text-lg"><span className="text-gray-300">Total</span><span className="font-semibold text-amber-400">{inr(total)}</span></div>
            <button onClick={confirm} className={`${goldBtn} w-full`}><Send size={18} /> Confirm Order via WhatsApp</button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ───────────── Gallery ───────────── */
function Gallery() {
  const { data } = useSanity(GALLERY_QUERY, MOCK_GALLERY);
  return (
    <Section id="gallery" alt>
      <Reveal><Heading sub="Evenings on the roof, and what comes out of the kitchen.">Rooftop gallery</Heading></Reveal>
      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-3 md:gap-4">
        {data.map((g, i) => (
          <Reveal key={g._id} delay={i * 60} className={`h-full ${i === 0 ? "col-span-2 row-span-2 md:col-span-2" : ""}`}>
            <figure className="group relative h-full overflow-hidden rounded-2xl">
              <img src={g.image?.asset?.url} alt={g.caption || "Vera's Kitchen"} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              {g.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 text-sm text-white transition duration-300 group-hover:translate-y-0">{g.caption}</figcaption>
              )}
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ───────────── Table booking ───────────── */
/* Field ab Booking ke bahar hai, isse typing me focus nahi jayega */
function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm text-gray-300">
        <Icon size={15} className="text-amber-400" />
        {label}
      </span>
      {children}
    </label>
  );
}

function Booking() {
  const [f, setF] = useState({ name: "", phone: "", date: "", time: "", guests: 2 });
  const [err, setErr] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\s/g, ""))) return setErr("Enter a valid 10-digit mobile number.");
    setErr("");
    const text = [
      "*Table Booking Request — Vera's Kitchen* 🪑",
      `👤 Name: ${f.name}`, `📞 Phone: ${f.phone}`,
      `📅 Date: ${f.date}`, `🕒 Time: ${f.time}`, `👥 Guests: ${f.guests}`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <Section id="book">
      <div className="grid gap-12 md:grid-cols-5">
        <Reveal className="md:col-span-2">
          <Heading sub="Tell us when you're coming and how many. We'll confirm your table on WhatsApp.">Reserve a rooftop table</Heading>
        </Reveal>
        <Reveal delay={150} className="md:col-span-3">
          <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/5 bg-[#18202c] p-6 sm:grid-cols-2 sm:p-8">
            <Field icon={ChefHat} label="Full name"><input required className={inputCls} value={f.name} onChange={set("name")} placeholder="Your name" /></Field>
            <Field icon={Phone} label="Phone"><input required inputMode="tel" className={inputCls} value={f.phone} onChange={set("phone")} placeholder="10-digit mobile" /></Field>
            <Field icon={CalendarDays} label="Date"><input required type="date" min={today} className={inputCls} value={f.date} onChange={set("date")} /></Field>
            <Field icon={Clock} label="Time"><input required type="time" className={inputCls} value={f.time} onChange={set("time")} /></Field>
            <div className="sm:col-span-2">
              <Field icon={Users} label="Number of guests">
                <input required type="number" min={1} max={30} className={inputCls} value={f.guests} onChange={set("guests")} />
              </Field>
            </div>
            {err && <p role="alert" className="text-sm text-red-400 sm:col-span-2">{err}</p>}
            <button type="submit" className={`${goldBtn} sm:col-span-2`}><Send size={18} /> Request Booking</button>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}

/* ───────────── Contact + footer ───────────── */
function Contact() {
  return (
    <footer id="contact" className="scroll-mt-20 border-t border-white/5 bg-[#18202c]">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal><Heading>Find us in Choudharan Colony</Heading></Reveal>
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex gap-4"><MapPin className="mt-1 shrink-0 text-amber-400" /><div><h3 className="font-display text-xl text-white">Address</h3><p className="mt-1 leading-relaxed text-gray-400">{ADDRESS}</p></div></div>
          <div className="flex gap-4"><Clock className="mt-1 shrink-0 text-amber-400" /><div><h3 className="font-display text-xl text-white">Hours</h3><p className="mt-1 text-gray-400">Daily, 11:00 AM – 11:00 PM</p><p className="text-xs text-gray-500">Update with confirmed timings</p></div></div>
          <div className="flex gap-4"><Phone className="mt-1 shrink-0 text-amber-400" /><div><h3 className="font-display text-xl text-white">Call or WhatsApp</h3><a href={`tel:+${WHATSAPP_NUMBER}`} className="mt-1 block text-gray-400 hover:text-amber-400">{PHONE_DISPLAY}</a></div></div>
        </div>
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10">
          <iframe title="Vera's Kitchen on Google Maps" src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[320px] w-full md:h-[420px]" style={{ border: 0 }} allowFullScreen />
        </div>
        <p className="mt-12 text-center text-sm text-gray-500">© {new Date().getFullYear()} Vera's Kitchen, Guna. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ───────────── App ───────────── */
export default function App() {
  const [cart, setCart] = useState({}); // { [_id]: { item, qty } }
  const [open, setOpen] = useState(false);

  const add = (item) => setCart((c) => ({ ...c, [item._id]: { item, qty: (c[item._id]?.qty || 0) + 1 } }));
  const remove = (id) => setCart((c) => {
    const n = { ...c };
    if (!n[id]) return c;
    if (n[id].qty <= 1) delete n[id]; else n[id] = { ...n[id], qty: n[id].qty - 1 };
    return n;
  });
  const { total, count } = useMemo(() => Object.values(cart).reduce(
    (a, { item, qty }) => ({ total: a.total + item.price * qty, count: a.count + qty }), { total: 0, count: 0 }), [cart]);

  return (
    <div className="min-h-screen bg-[#1F2937] font-sans text-gray-200 antialiased [scroll-behavior:smooth]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=DM+Sans:wght@400;500;600&display=swap');
        html{scroll-behavior:smooth}
        .font-sans{font-family:'DM Sans',system-ui,sans-serif}
        .font-display{font-family:'Fraunces',Georgia,serif;font-weight:500}
        @media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
      `}</style>
      <Navbar cartCount={count} onCart={() => setOpen(true)} />
      <main>
        <Hero />
        <About />
        <MenuSection cart={cart} add={add} remove={remove} />
        <Gallery />
        <Booking />
      </main>
      <Contact />
      <CartDrawer cart={cart} open={open} setOpen={setOpen} add={add} remove={remove} clear={() => setCart({})} total={total} count={count} />
    </div>
  );
}
