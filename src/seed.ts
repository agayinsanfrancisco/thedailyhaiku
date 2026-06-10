import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./lib/db/schema";
import additionalEvents from "../data/additional-events.json";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./data/thedailyhaiku.db",
});

const db = drizzle(client, { schema });

const categoriesList = [
  { name: "Movies & TV", slug: "movies-tv", description: "Film and television moments", color: "#1a3a3a" },
  { name: "Music", slug: "music", description: "Musical milestones and moments", color: "#3a6a5a" },
  { name: "Sports", slug: "sports", description: "Athletic achievements and history", color: "#5a6a3a" },
  { name: "Technology", slug: "technology", description: "Tech breakthroughs and innovations", color: "#3a5a6a" },
  { name: "Science & Nature", slug: "science-nature", description: "Scientific discoveries and natural wonders", color: "#4a3a6a" },
  { name: "Politics & History", slug: "politics-history", description: "Political and historical events", color: "#6a4a3a" },
  { name: "Literature", slug: "literature", description: "Literary works and authors", color: "#3a6a6a" },
  { name: "Art & Design", slug: "art-design", description: "Artistic and design achievements", color: "#6a5a3a" },
  { name: "LGBTQIA+", slug: "lgbtqia", description: "Queer history and culture", color: "#8a4a6a" },
];

const eventsList = [
  { month: 1, day: 1, year: 1962, title: "The Beatles audition for Decca Records and are rejected", categorySlug: "music" },
  { month: 1, day: 12, year: 1959, title: "Berry Gordy founds Motown Records with an $800 loan", categorySlug: "music" },
  { month: 1, day: 15, year: 2001, title: "Wikipedia launches on the internet", categorySlug: "technology" },
  { month: 1, day: 24, year: 1984, title: "Apple Macintosh goes on sale with the iconic 1984 Super Bowl ad", categorySlug: "technology" },
  { month: 1, day: 27, year: 1986, title: "The Cure performs 'Boys Don't Cry' at Rock in Rio", categorySlug: "music" },
  { month: 2, day: 1, year: 1960, title: "The Greensboro sit-in sparks a wave of civil rights protests", categorySlug: "politics-history" },
  { month: 2, day: 4, year: 2004, title: "Mark Zuckerberg launches Facebook from his Harvard dorm", categorySlug: "technology" },
  { month: 2, day: 7, year: 1964, title: "The Beatles arrive in New York for their first US visit", categorySlug: "music" },
  { month: 2, day: 9, year: 1964, title: "The Beatles appear on The Ed Sullivan Show to 73 million viewers", categorySlug: "music" },
  { month: 2, day: 15, year: 1965, title: "Canada adopts the maple leaf flag for the first time", categorySlug: "politics-history" },
  { month: 2, day: 23, year: 1997, title: "Dolly the sheep is unveiled to the world as the first cloned mammal", categorySlug: "science-nature" },
  { month: 2, day: 29, year: 1940, title: "Hattie McDaniel becomes the first Black Oscar winner (Gone With the Wind)", categorySlug: "movies-tv" },
  { month: 3, day: 3, year: 1991, title: "Rodney King beating video sparks national outrage and protests", categorySlug: "politics-history" },
  { month: 3, day: 9, year: 1959, title: "Barbie doll makes her debut at the American International Toy Fair", categorySlug: "art-design" },
  { month: 3, day: 15, year: 44, title: "Julius Caesar is assassinated by Roman senators", categorySlug: "politics-history" },
  { month: 3, day: 20, year: 2003, title: "US invades Iraq, beginning the Iraq War", categorySlug: "politics-history" },
  { month: 3, day: 22, year: 1997, title: "Titanic (1997) premieres and becomes the highest-grossing film of all time", categorySlug: "movies-tv" },
  { month: 3, day: 30, year: 1981, title: "President Ronald Reagan is shot by John Hinckley Jr.", categorySlug: "politics-history" },
  { month: 4, day: 1, year: 1976, title: "Apple Computer is founded by Steve Jobs and Steve Wozniak", categorySlug: "technology" },
  { month: 4, day: 4, year: 1968, title: "Martin Luther King Jr. is assassinated in Memphis", categorySlug: "politics-history" },
  { month: 4, day: 10, year: 1970, title: "Paul McCartney announces the Beatles have broken up", categorySlug: "music" },
  { month: 4, day: 14, year: 1912, title: "RMS Titanic strikes an iceberg and sinks on her maiden voyage", categorySlug: "politics-history" },
  { month: 4, day: 22, year: 1970, title: "First Earth Day celebrated, sparking the modern environmental movement", categorySlug: "science-nature" },
  { month: 4, day: 26, year: 1986, title: "Chernobyl nuclear disaster occurs in Soviet Ukraine", categorySlug: "science-nature" },
  { month: 4, day: 30, year: 1993, title: "CERN announces the World Wide Web will be free to everyone", categorySlug: "technology" },
  { month: 5, day: 2, year: 2011, title: "Osama bin Laden is killed by US Navy SEALs in Pakistan", categorySlug: "politics-history" },
  { month: 5, day: 4, year: 1979, title: "Margaret Thatcher becomes the first female UK Prime Minister", categorySlug: "politics-history" },
  { month: 5, day: 10, year: 1994, title: "Nelson Mandela is inaugurated as South Africa's first Black president", categorySlug: "politics-history" },
  { month: 5, day: 17, year: 1954, title: "Brown v. Board of Education declares school segregation unconstitutional", categorySlug: "politics-history" },
  { month: 5, day: 25, year: 1977, title: "Star Wars: A New Hope releases and changes cinema forever", categorySlug: "movies-tv" },
  { month: 5, day: 29, year: 1953, title: "Edmund Hillary and Tenzing Norgay reach the summit of Everest", categorySlug: "science-nature" },
  { month: 6, day: 2, year: 1953, title: "Queen Elizabeth II is crowned at Westminster Abbey", categorySlug: "politics-history" },
  { month: 6, day: 6, year: 1944, title: "D-Day: Allied forces land on Normandy beaches during WWII", categorySlug: "politics-history" },
  { month: 6, day: 9, year: 1978, title: "The first computerized postage meter is introduced by Pitney Bowes", categorySlug: "technology" },
  { month: 6, day: 12, year: 1994, title: "O.J. Simpson leads police on a slow-speed chase in a white Bronco", categorySlug: "movies-tv" },
  { month: 6, day: 15, year: 1996, title: "The Phantom Menace begins filming — the first Star Wars prequel", categorySlug: "movies-tv" },
  { month: 6, day: 20, year: 1975, title: "Jaws opens in theaters, creating the summer blockbuster", categorySlug: "movies-tv" },
  { month: 6, day: 25, year: 2009, title: "Michael Jackson dies at age 50, shocking the world", categorySlug: "music" },
  { month: 6, day: 29, year: 2007, title: "The first iPhone goes on sale, revolutionizing smartphones", categorySlug: "technology" },
  { month: 7, day: 4, year: 1776, title: "US Declaration of Independence is adopted by the Continental Congress", categorySlug: "politics-history" },
  { month: 7, day: 11, year: 1979, title: "Skylab crashes back to Earth, scattering debris across Australia", categorySlug: "science-nature" },
  { month: 7, day: 16, year: 1969, title: "Apollo 11 launches to the moon with Neil Armstrong and Buzz Aldrin", categorySlug: "science-nature" },
  { month: 7, day: 20, year: 1969, title: "Neil Armstrong walks on the moon: 'One small step for man'", categorySlug: "science-nature" },
  { month: 7, day: 21, year: 2011, title: "NASA's Space Shuttle program ends with the final Atlantis landing", categorySlug: "science-nature" },
  { month: 7, day: 26, year: 2005, title: "Space Shuttle Discovery launches on the Return to Flight mission", categorySlug: "science-nature" },
  { month: 7, day: 31, year: 1964, title: "Ranger 7 transmits the first close-up images of the Moon", categorySlug: "science-nature" },
  { month: 8, day: 5, year: 1962, title: "Marilyn Monroe is found dead at age 36", categorySlug: "movies-tv" },
  { month: 8, day: 9, year: 1995, title: "Netscape goes public, igniting the dot-com boom", categorySlug: "technology" },
  { month: 8, day: 12, year: 1981, title: "IBM releases the first personal computer, the IBM PC 5150", categorySlug: "technology" },
  { month: 8, day: 16, year: 1977, title: "Elvis Presley dies at Graceland at age 42", categorySlug: "music" },
  { month: 8, day: 21, year: 1959, title: "Hawaii becomes the 50th US state", categorySlug: "politics-history" },
  { month: 8, day: 28, year: 1963, title: "Martin Luther King Jr. delivers 'I Have a Dream' at the March on Washington", categorySlug: "politics-history" },
  { month: 9, day: 1, year: 1939, title: "Germany invades Poland, beginning World War II", categorySlug: "politics-history" },
  { month: 9, day: 4, year: 1998, title: "Google is founded by Larry Page and Sergey Brin", categorySlug: "technology" },
  { month: 9, day: 11, year: 2001, title: "9/11 terrorist attacks on the World Trade Center and Pentagon", categorySlug: "politics-history" },
  { month: 9, day: 15, year: 1963, title: "Four girls killed in the 16th Street Baptist Church bombing in Birmingham", categorySlug: "politics-history" },
  { month: 9, day: 21, year: 1999, title: "Taiwan is hit by a devastating 7.6 magnitude earthquake", categorySlug: "science-nature" },
  { month: 9, day: 26, year: 1960, title: "The first televised presidential debate: Kennedy vs. Nixon", categorySlug: "politics-history" },
  { month: 9, day: 29, year: 1982, title: "Cyanide-laced Tylenol kills seven people in Chicago area", categorySlug: "politics-history" },
  { month: 10, day: 1, year: 1971, title: "Walt Disney World opens in Orlando, Florida", categorySlug: "art-design" },
  { month: 10, day: 5, year: 1962, title: "Dr. No, the first James Bond film, premieres", categorySlug: "movies-tv" },
  { month: 10, day: 11, year: 1984, title: "Space Shuttle Challenger astronaut Kathryn Sullivan becomes first American woman to walk in space", categorySlug: "science-nature" },
  { month: 10, day: 15, year: 1997, title: "Cassini-Huygens spacecraft launches toward Saturn", categorySlug: "science-nature" },
  { month: 10, day: 18, year: 1989, title: "Galileo spacecraft launches on its mission to Jupiter", categorySlug: "science-nature" },
  { month: 10, day: 22, year: 1962, title: "Cuban Missile Crisis begins as Kennedy reveals Soviet missiles in Cuba", categorySlug: "politics-history" },
  { month: 10, day: 28, year: 1886, title: "Statue of Liberty is dedicated in New York Harbor", categorySlug: "art-design" },
  { month: 11, day: 4, year: 2008, title: "Barack Obama is elected first Black US President", categorySlug: "politics-history" },
  { month: 11, day: 9, year: 1989, title: "The Berlin Wall falls, symbolizing the end of the Cold War", categorySlug: "politics-history" },
  { month: 11, day: 12, year: 2014, title: "Philae lander touches down on Comet 67P, a space first", categorySlug: "science-nature" },
  { month: 11, day: 16, year: 1973, title: "Skylab launches as America's first space station", categorySlug: "science-nature" },
  { month: 11, day: 20, year: 1985, title: "Microsoft releases Windows 1.0", categorySlug: "technology" },
  { month: 11, day: 22, year: 1963, title: "President John F. Kennedy is assassinated in Dallas", categorySlug: "politics-history" },
  { month: 11, day: 26, year: 1922, title: "Howard Carter enters Tutankhamun's tomb for the first time", categorySlug: "art-design" },
  { month: 12, day: 1, year: 1955, title: "Rosa Parks refuses to give up her bus seat in Montgomery", categorySlug: "politics-history" },
  { month: 12, day: 4, year: 1992, title: "President George H.W. Bush sends US troops to Somalia", categorySlug: "politics-history" },
  { month: 12, day: 8, year: 1980, title: "John Lennon is shot and killed outside his NYC apartment", categorySlug: "music" },
  { month: 12, day: 11, year: 1964, title: "Che Guevara speaks at the UN General Assembly", categorySlug: "politics-history" },
  { month: 12, day: 15, year: 1939, title: "Gone with the Wind premieres in Atlanta", categorySlug: "movies-tv" },
  { month: 12, day: 17, year: 1903, title: "Wright Brothers make the first powered flight at Kitty Hawk", categorySlug: "science-nature" },
  { month: 12, day: 21, year: 1988, title: "Pan Am Flight 103 is bombed over Lockerbie, Scotland", categorySlug: "politics-history" },
  { month: 12, day: 25, year: 1991, title: "Mikhail Gorbachev resigns, the Soviet Union is dissolved", categorySlug: "politics-history" },
  { month: 12, day: 31, year: 1999, title: "The world celebrates the turn of the millennium and Y2K passes peacefully", categorySlug: "technology" },
];

async function main() {
  console.log("Seeding database...");

  for (const cat of categoriesList) {
    await db.insert(schema.categories).values(cat).onConflictDoNothing({ target: schema.categories.slug });
    console.log(`  Category: ${cat.name}`);
  }

  const allCategories = await db.select().from(schema.categories);
  const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]));

  for (const evt of eventsList) {
    await db
      .insert(schema.events)
      .values({
        month: evt.month,
        day: evt.day,
        year: evt.year,
        title: evt.title,
        categoryId: categoryMap.get(evt.categorySlug) ?? null,
      })
      .onConflictDoNothing({ target: schema.events.id });
    console.log(`  Event: ${evt.month}/${evt.day} - ${evt.title}`);
  }

  for (const evt of additionalEvents) {
    await db
      .insert(schema.events)
      .values({
        month: evt.m,
        day: evt.d,
        year: evt.y,
        title: evt.t,
        categoryId: categoryMap.get(evt.c) ?? null,
      })
      .onConflictDoNothing({ target: schema.events.id });
  }

  console.log("Seed complete!");
}

main().catch(console.error);
