/* =========================================================
   دوري ميدي للمحترفين 2026
   JavaScript - app.js
   ========================================================= */

"use strict";

/* =========================
   بيانات التطبيق الأساسية
========================= */

const App = {
    name: "دوري ميدي للمحترفين 2026",

    data: {
        season: {
            name: "دوري ميدي للمحترفين 2026",
            status: "active"
        },

        teams: [],

        players: [],

        matches: [],

        news: [],

        settings: {
            theme: "light"
        }
    }
};


/* =========================
   أدوات مساعدة
========================= */

function $(selector) {
    return document.querySelector(selector);
}

function $all(selector) {
    return document.querySelectorAll(selector);
}

function createId(prefix = "id") {
    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).substring(2, 8)
    );
}


/* =========================
   التخزين المحلي
   مؤقت للتجربة فقط
========================= */

function saveLocalData() {
    try {
        localStorage.setItem(
            "midi_league_data",
            JSON.stringify(App.data)
        );

        console.log("تم حفظ البيانات محليًا");
    } catch (error) {
        console.error("خطأ في الحفظ المحلي:", error);
    }
}


function loadLocalData() {
    try {
        const saved = localStorage.getItem("midi_league_data");

        if (!saved) {
            return;
        }

        const parsed = JSON.parse(saved);

        if (parsed && typeof parsed === "object") {
            App.data = {
                ...App.data,
                ...parsed
            };
        }

        console.log("تم تحميل البيانات المحلية");
    } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
    }
}


/* =========================
   الفرق
========================= */

function addTeam(name, logo = "") {
    if (!name || !name.trim()) {
        return false;
    }

    const team = {
        id: createId("team"),
        name: name.trim(),
        logo: logo.trim()
    };

    App.data.teams.push(team);

    saveLocalData();
    renderAll();

    return team;
}


function removeTeam(teamId) {
    App.data.teams = App.data.teams.filter(
        team => team.id !== teamId
    );

    saveLocalData();
    renderAll();
}


function getTeam(teamId) {
    return App.data.teams.find(
        team => team.id === teamId
    );
}


/* =========================
   اللاعبين
========================= */

function addPlayer(teamId, name, image = "", position = "") {
    if (!teamId || !name || !name.trim()) {
        return false;
    }

    const player = {
        id: createId("player"),
        teamId: teamId,
        name: name.trim(),
        image: image.trim(),
        position: position.trim()
    };

    App.data.players.push(player);

    saveLocalData();
    renderAll();

    return player;
}


function removePlayer(playerId) {
    App.data.players = App.data.players.filter(
        player => player.id !== playerId
    );

    saveLocalData();
    renderAll();
}


function getPlayersByTeam(teamId) {
    return App.data.players.filter(
        player => player.teamId === teamId
    );
}


/* =========================
   المباريات
========================= */

function addMatch(matchData) {
    if (
        !matchData ||
        !matchData.homeTeam ||
        !matchData.awayTeam
    ) {
        return false;
    }

    const match = {
        id: createId("match"),

        homeTeam: matchData.homeTeam,

        awayTeam: matchData.awayTeam,

        date: matchData.date || "",

        time: matchData.time || "04:30",

        stage: matchData.stage || "الجولة 1",

        status: matchData.status || "upcoming",

        homeScore:
            matchData.homeScore !== undefined
                ? Number(matchData.homeScore)
                : null,

        awayScore:
            matchData.awayScore !== undefined
                ? Number(matchData.awayScore)
                : null,

        goals: [],

        cards: [],

        details: matchData.details || ""
    };

    App.data.matches.push(match);

    saveLocalData();
    renderAll();

    return match;
}


function updateMatch(matchId, changes) {
    const match = App.data.matches.find(
        item => item.id === matchId
    );

    if (!match) {
        return false;
    }

    Object.assign(match, changes);

    saveLocalData();
    renderAll();

    return true;
}


function removeMatch(matchId) {
    App.data.matches = App.data.matches.filter(
        match => match.id !== matchId
    );

    saveLocalData();
    renderAll();
}


/* =========================
   أهداف المباراة
========================= */

function addGoal(matchId, playerId, teamId, minute = "") {
    const match = App.data.matches.find(
        item => item.id === matchId
    );

    if (!match) {
        return false;
    }

    match.goals.push({
        id: createId("goal"),
        playerId,
        teamId,
        minute: minute || ""
    });

    saveLocalData();
    renderAll();

    return true;
}


/* =========================
   البطاقات
========================= */

function addCard(
    matchId,
    playerId,
    teamId,
    type,
    minute = ""
) {
    const match = App.data.matches.find(
        item => item.id === matchId
    );

    if (!match) {
        return false;
    }

    match.cards.push({
        id: createId("card"),
        playerId,
        teamId,
        type,
        minute: minute || ""
    });

    saveLocalData();
    renderAll();

    return true;
}


/* =========================
   الأخبار
========================= */

function addNews(title, content, mediaUrl = "") {
    if (!title || !title.trim()) {
        return false;
    }

    const news = {
        id: createId("news"),
        title: title.trim(),
        content: content || "",
        mediaUrl: mediaUrl || "",
        createdAt: new Date().toISOString()
    };

    App.data.news.unshift(news);

    saveLocalData();
    renderAll();

    return news;
}


function removeNews(newsId) {
    App.data.news = App.data.news.filter(
        news => news.id !== newsId
    );

    saveLocalData();
    renderAll();
}


/* =========================
   ترتيب الدوري
========================= */

function calculateStandings() {
    const table = {};

    App.data.teams.forEach(team => {
        table[team.id] = {
            teamId: team.id,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
        };
    });

    App.data.matches.forEach(match => {
        if (
            match.status !== "finished" ||
            match.homeScore === null ||
            match.awayScore === null
        ) {
            return;
        }

        const home = table[match.homeTeam];
        const away = table[match.awayTeam];

        if (!home || !away) {
            return;
        }

        const homeScore = Number(match.homeScore);
        const awayScore = Number(match.awayScore);

        home.played++;
        away.played++;

        home.goalsFor += homeScore;
        home.goalsAgainst += awayScore;

        away.goalsFor += awayScore;
        away.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
            home.wins++;
            away.losses++;

            home.points += 3;
        } else if (homeScore < awayScore) {
            away.wins++;
            home.losses++;

            away.points += 3;
        } else {
            home.draws++;
            away.draws++;

            home.points++;
            away.points++;
        }
    });

    Object.values(table).forEach(team => {
        team.goalDifference =
            team.goalsFor - team.goalsAgainst;
    });

    return Object.values(table).sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }

        if (b.goalDifference !== a.goalDifference) {
            return b.goalDifference - a.goalDifference;
        }

        return b.goalsFor - a.goalsFor;
    });
}


/* =========================
   الهدافون
========================= */

function calculateScorers() {
    const scorers = {};

    App.data.matches.forEach(match => {
        if (match.status !== "finished") {
            return;
        }

        if (!Array.isArray(match.goals)) {
            return;
        }

        match.goals.forEach(goal => {
            if (!goal.playerId) {
                return;
            }

            if (!scorers[goal.playerId]) {
                scorers[goal.playerId] = {
                    playerId: goal.playerId,
                    goals: 0
                };
            }

            scorers[goal.playerId].goals++;
        });
    });

    return Object.values(scorers).sort(
        (a, b) => b.goals - a.goals
    );
}


/* =========================
   عرض البيانات
========================= */

function renderTeams() {
    console.log(
        "عدد الفرق:",
        App.data.teams.length
    );
}


function renderPlayers() {
    console.log(
        "عدد اللاعبين:",
        App.data.players.length
    );
}


function renderMatches() {
    console.log(
        "عدد المباريات:",
        App.data.matches.length
    );
}


function renderStandings() {
    const standings = calculateStandings();

    console.log(
        "الترتيب:",
        standings
    );
}


function renderNews() {
    console.log(
        "عدد الأخبار:",
        App.data.news.length
    );
}


function renderAll() {
    renderTeams();
    renderPlayers();
    renderMatches();
    renderStandings();
    renderNews();
}


/* =========================
   تشغيل التطبيق
========================= */

function initApp() {
    console.log(
        "تم تشغيل دوري ميدي للمحترفين 2026"
    );

    loadLocalData();

    renderAll();
}


/* =========================
   بدء التطبيق
========================= */

document.addEventListener(
    "DOMContentLoaded",
    initApp
);
