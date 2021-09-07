import supertest from "supertest";
import app from "./server";
import { ADVENTURE_ADMIN, KOI, MYSTERIOUS_ROBED_FIGURE, YIAYIA } from "./constants/characters";
import { CAVE_EXTERIOR, FRIENDLY_ISLAND, HANDFORTH_PARISH_COUNCIL } from "./constants/locations";

test("GET / responds with a welcome message from our mysterious robed figure", async () => {
  const response = await supertest(app).get("/");

  expect(response.body).toStrictEqual({
    location: CAVE_EXTERIOR,
    speech: {
      speaker: MYSTERIOUS_ROBED_FIGURE,
      text:
        "Welcome, young adventurer, to the ENDPOINT ADVENTURE. Are you ready for this quest?",
    },
    options: {
      yes: "/quest/accept",
      no: "/quest/decline",
      help: "/help",
    },
  });
});

test("GET /quest/accept has our mysterious robed figure give a couple of further choices", async () => {
  const response = await supertest(app).get("/quest/accept");

  // check the speaker and location are right
  expect(response.body).toMatchObject({
    location: CAVE_EXTERIOR,
    speech: {
      speaker: MYSTERIOUS_ROBED_FIGURE,
    },
  });

  // check the robed figure is saying something
  expect(typeof response.body.speech.text).toBe("string");

  // check that there are at least two further options
  expect(Object.keys(response.body.options).length).toBeGreaterThanOrEqual(2);
});

test("GET /quest/decline responds with an apocalyptic message", async () => {
  const response = await supertest(app).get("/quest/decline");

  // located in the apocalypse
  expect(response.body.location).toBe("Apocalypse");

  // aggro speaker
  expect(response.body.speech.speaker.name).toBe("Titan, Destroyer of Worlds");

  // some aggro message
  expect(response.body.speech.text).toMatch("FOOL");
  expect(response.body.speech.text).toMatch(/mistake/i);

  // only includes the option to restart
  expect(response.body.options).toStrictEqual({ restart: "/" });
});

test("GET /quest/start/impossible responds with instant 'death'", async () => {
  const response = await supertest(app).get("/quest/start/impossible");

  // there is _some_ location
  expect(response.body.location).toBeDefined();

  // there is _some_ speaker
  expect(response.body.speech.speaker.name).toBeDefined();

  // fiery death
  expect(response.body.speech.text).toMatch(/fireball/i);
  expect(response.body.speech.text).toMatch(/dragon/i);
  expect(response.body.speech.text).toMatch(/excruciating/i);

  // includes option to restart
  expect(response.body.options).toMatchObject({ restart: "/" });
});


test("GET /help shows description of DnD type of game", async () => {
  const response = await supertest(app).get("/help");

  // there is _some_ location
  expect(response.body.location).toBe(HANDFORTH_PARISH_COUNCIL);

  // there is _some_ speaker
  expect(response.body.speech.speaker).toEqual(ADVENTURE_ADMIN);

  // response.body.speech.text (help description) is of type string
  expect(typeof response.body.speech.text).toBe("string");

  // includes option to to go back to start
  expect(response.body.options).toMatchObject({ backToStart: "/" });
});


test("GET /quest/start/easy starts game with an easy boss", async () => {
  const response = await supertest(app).get("/quest/start/easy");

  // located in Ikaria
  expect(response.body.location).toBe("Ikaria");

  // mini boss speaker
  expect(response.body.speech.speaker.name).toBe("Alex");

  // boss speaker message
  expect(response.body.speech.text).toMatch(/tinos/i);

  // includes option to respond
  expect(response.body.options).toMatchObject({ respondFriendly: "/quest/start/easy/friendly-response", 
  respondAggressively: "/quest/start/easy/aggro-response"});
});


test("GET /quest/start/hard starts game with a challenging boss", async () => {
  const response = await supertest(app).get("/quest/start/hard");

  // located in Loch Nes
  expect(response.body.location).toBe("Loch Nes");

  // mini boss speaker
  expect(response.body.speech.speaker).toEqual(KOI);

  // boss speaker message
  expect(response.body.speech.text).toMatch(/lucky/i);
  expect(response.body.speech.text).toMatch(/charm/i);

  // includes option to respond
  expect(response.body.options).toMatchObject({ yes: "/quest/start/hard/yes", 
  no: "/quest/start/hard/no"});
});