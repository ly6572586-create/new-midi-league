/* =========================================
   دوري ميدي للمحترفين 2026
   الملف: js/app.js
   ========================================= */

let leagueData = INITIAL_DATA;
let currentTab = "matches";

/* =========================
   تشغيل الموقع
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupTheme();
    loadLeagueData();
});


/* =========================
   التنقل
   ========================= */

function setupNavigation() {
    const buttons = document.querySelectorAll("[data-tab]");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const tab = button.dataset.tab;

            if (!tab) return;

            showTab(tab);
        });
    });
}


function showTab(tab) {
    currentTab = tab;

    const sections = {
        matches: "sec-matches",
        standings: "sec-standings",
        news: "sec-news",
        teams: "sec-teams",
        scorers: "sec-scorers"
    };

    Object.values(sections).forEach(id => {
        const section = document.getElementById(id);

        if (section) {
            section.classList.add("hidden");
        }
    });

    const selectedSection = document.getElementById(sections[tab]);

    if (selectedSection) {
        selectedSection.classList.remove("hidden");
    }

    document.querySelectorAll("[data-tab]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.tab === tab
        );
    });
}


/* =========================
   تحميل البيانات
   ========================= */

async function loadLeagueData() {
    try {
        const { data, error } = await supabaseClient
            .from("new_league_data")
            .select("data")
            .eq("id", 1)
            .maybeSingle();

        if (error) {
            console.error("خطأ في تحميل بيانات الدوري:", error);

            leagueData = INITIAL_DATA;

            renderAll();

            return;
        }

        if (data && data.data) {
            leagueData = data.data;
        } else {
            leagueData = INITIAL_DATA;
        }

        renderAll();

    } catch (error) {
        console.error("حدث خطأ غير متوقع:", error);

        leagueData = INITIAL_DATA;

        renderAll();
    }
}


/* =========================
   عرض كل المحتوى
   ========================= */

function renderAll() {
    renderMatches();
    renderStandings();
    renderTeams();
    renderNews();
    renderScorers();
    renderCards();
    renderNextMatch();
}


/* =========================
   المباريات
   ========================= */

function renderMatches() {
    const container = document.getElementById("matches");

    if (!container) return;

    const matches = Array.isArray(leagueData.matches)
        ? leagueData.matches
        : [];

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="card">
                لا توجد مباريات حاليًا.
            </div>
        `;

        return;
    }

    const sortedMatches = [...matches].sort(
        (a, b) =>
            new Date(a.date || 0) -
            new Date(b.date || 0)
    );

    container.innerHTML = sortedMatches
        .map(match => {

            const team1 = getTeam(match.team1);
            const team2 = getTeam(match.team2);

            const team1Name =
                team1?.name || match.team1 || "الفريق الأول";

            const team2Name =
                team2?.name || match.team2 || "الفريق الثاني";

            const team1Logo =
                team1?.logo || "";

            const team2Logo =
                team2?.logo || "";

            const finished =
                match.status === "finished" ||
                (
                    match.score1 !== undefined &&
                    match.score2 !== undefined
                );

            const score = finished
                ? `${match.score1 ?? 0} - ${match.score2 ?? 0}`
                : "VS";

            return `
                <article class="match-card">

                    <div class="match-top">

                        <div class="match-date">
                            ${formatDate(match.date)}
                        </div>

                        <div class="round">
                            ${escapeHtml(match.stage || "مباراة")}
                        </div>

                    </div>


                    <div class="teams">

                        <div class="team">

                            ${
                                team1Logo
                                ? `
                                    <img
                                        class="team-logo"
                                        src="${escapeAttribute(team1Logo)}"
                                        alt="${escapeAttribute(team1Name)}"
                                    >
                                `
                                : ""
                            }

                            <div class="team-name">
                                ${escapeHtml(team1Name)}
                            </div>

                        </div>


                        <div>
                            <div class="${finished ? "score" : "vs"}">
                                ${score}
                            </div>
                        </div>


                        <div class="team">

                            ${
                                team2Logo
                                ? `
                                    <img
                                        class="team-logo"
                                        src="${escapeAttribute(team2Logo)}"
                                        alt="${escapeAttribute(team2Name)}"
                                    >
                                `
                                : ""
                            }

                            <div class="team-name">
                                ${escapeHtml(team2Name)}
                            </div>

                        </div>

                    </div>


                    ${renderMatchEvents(match)}

                </article>
            `;
        })
        .join("");
}


function renderMatchEvents(match) {
    const events = [];

    if (Array.isArray(match.scorers)) {
        match.scorers.forEach(item => {
            if (!item) return;

            const player =
                typeof item === "string"
                    ? item
                    : item.player || item.name || "";

            if (player) {
                events.push(`⚽ ${escapeHtml(player)}`);
            }
        });
    }

    if (Array.isArray(match.cards)) {
        match.cards.forEach(item => {
            if (!item) return;

            const player =
                typeof item === "string"
                    ? item
                    : item.player || item.name || "";

            const type =
                typeof item === "object"
                    ? item.type || ""
                    : "";

            if (player) {
                events.push(
                    `${type === "red" ? "🟥" : "🟨"} ${escapeHtml(player)}`
                );
            }
        });
    }

    if (match.details) {
        events.push(
            `📝 ${escapeHtml(match.details)}`
        );
    }

    if (events.length === 0) {
        return "";
    }

    return `
        <div class="match-events">
            ${events
                .map(event => `<div class="event">${event}</div>`)
                .join("")}
        </div>
    `;
}


/* =========================
   جدول الترتيب
   ========================= */

function renderStandings() {
    const container = document.getElementById("standings");

    if (!container) return;

    const teams = Array.isArray(leagueData.teams)
        ? leagueData.teams
        : [];

    const matches = Array.isArray(leagueData.matches)
        ? leagueData.matches
        : [];

    const table = teams.map(team => ({
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        points: 0
    }));

    matches.forEach(match => {

        if (
            match.score1 === undefined ||
            match.score2 === undefined
        ) {
            return;
        }

        const home = table.find(
            item => item.team.name === match.team1
        );

        const away = table.find(
            item => item.team.name === match.team2
        );

        if (!home || !away) return;

        const s1 = Number(match.score1);
        const s2 = Number(match.score2);

        home.played++;
        away.played++;

        home.gf += s1;
        home.ga += s2;

        away.gf += s2;
        away.ga += s1;

        if (s1 > s2) {
            home.wins++;
            home.points += 3;
            away.losses++;
        } else if (s2 > s1) {
            away.wins++;
            away.points += 3;
            home.losses++;
        } else {
            home.draws++;
            away.draws++;

            home.points++;
            away.points++;
        }
    });

    table.sort((a, b) => {

        const gdA = a.gf - a.ga;
        const gdB = b.gf - b.ga;

        return (
            b.points - a.points ||
            gdB - gdA ||
            b.gf - a.gf
        );
    });

    container.innerHTML = table
        .map((item, index) => {

            const gd = item.gf - item.ga;

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(item.team.name)}</td>
                    <td>${item.played}</td>
                    <td>${item.wins}</td>
                    <td>${item.draws}</td>
                    <td>${item.losses}</td>
                    <td>${item.gf}</td>
                    <td>${item.ga}</td>
                    <td>${gd > 0 ? "+" : ""}${gd}</td>
                    <td><strong>${item.points}</strong></td>
                </tr>
            `;
        })
        .join("");
}


/* =========================
   الفرق واللاعبون
   ========================= */

function renderTeams() {
    const container = document.getElementById("teams");

    if (!container) return;

    const teams = Array.isArray(leagueData.teams)
        ? leagueData.teams
        : [];

    if (teams.length === 0) {
        container.innerHTML = `
            <div class="card">
                لا توجد فرق حاليًا.
            </div>
        `;

        return;
    }

    container.innerHTML = teams
        .map(team => {

            const players = Array.isArray(team.players)
                ? team.players
                : [];

            return `
                <div class="team-card">

                    <div class="team-card-head">

                        ${
                            team.logo
                            ? `
                                <img
                                    src="${escapeAttribute(team.logo)}"
                                    alt="${escapeAttribute(team.name)}"
                                >
                            `
                            : ""
                        }

                        <div>
                            <strong>
                                ${escapeHtml(team.name)}
                            </strong>

                            <div>
                                ${players.length} لاعب
                            </div>
                        </div>

                    </div>


                    <div class="players">

                        ${
                            players.length
                            ? players.map(player => {

                                const playerName =
                                    typeof player === "string"
                                        ? player
                                        : player.name || "";

                                const image =
                                    typeof player === "object"
                                        ? player.image || ""
                                        : "";

                                return `
                                    <div class="player">

                                        ${
                                            image
                                            ? `
                                                <img
                                                    src="${escapeAttribute(image)}"
                                                    alt="${escapeAttribute(playerName)}"
                                                >
                                            `
                                            : ""
                                        }

                                        <div class="player-name">
                                            ${escapeHtml(playerName)}
                                        </div>

                                    </div>
                                `;

                            }).join("")
                            : "<div>لا يوجد لاعبين.</div>"
                        }

                    </div>

                </div>
            `;
        })
        .join("");
}


/* =========================
   الأخبار
   ========================= */

function renderNews() {
    const container = document.getElementById("news");

    if (!container) return;

    const news = Array.isArray(leagueData.news)
        ? leagueData.news
        : [];

    if (news.length === 0) {
        container.innerHTML = `
            <div class="card">
                لا توجد أخبار حاليًا.
            </div>
        `;

        return;
    }

    container.innerHTML = news
        .map(item => {

            let media = "";

            if (item.image) {
                media += `
                    <img
                        src="${escapeAttribute(item.image)}"
                        alt=""
                    >
                `;
            }

            if (item.video) {
                media += `
                    <video
                        src="${escapeAttribute(item.video)}"
                        controls
                    ></video>
                `;
            }

            if (item.youtube) {
                media += `
                    <iframe
                        src="${escapeAttribute(item.youtube)}"
                        allowfullscreen
                    ></iframe>
                `;
            }

            return `
                <article class="news-card">

                    ${media}

                    <div class="news-content">

                        <h3 class="news-title">
                            ${escapeHtml(item.title || "خبر")}
                        </h3>

                        <div class="news-text">
                            ${escapeHtml(item.text || "")}
                        </div>

                    </div>

                </article>
            `;
        })
        .join("");
}


/* =========================
   الهدافون
   ========================= */

function renderScorers() {
    const container = document.getElementById("scorers");

    if (!container) return;

    const matches = Array.isArray(leagueData.matches)
        ? leagueData.matches
        : [];

    const stats = {};

    matches.forEach(match => {

        if (!Array.isArray(match.scorers)) return;

        match.scorers.forEach(item => {

            const name =
                typeof item === "string"
                    ? item
                    : item.player || item.name;

            if (!name) return;

            stats[name] = (stats[name] || 0) + 1;
        });
    });

    const list = Object.entries(stats)
        .sort((a, b) => b[1] - a[1]);

    if (list.length === 0) {
        container.innerHTML = `
            <li>
                لا توجد أهداف مسجلة حاليًا.
            </li>
        `;

        return;
    }

    container.innerHTML = list
        .map(([name, goals]) => `
            <li>
                <span>${escapeHtml(name)}</span>
                <strong>${goals}</strong>
            </li>
        `)
        .join("");
}


/* =========================
   البطاقات
   ========================= */

function renderCards() {
    const container = document.getElementById("cards");

    if (!container) return;

    const matches = Array.isArray(leagueData.matches)
        ? leagueData.matches
        : [];

    const stats = {};

    matches.forEach(match => {

        if (!Array.isArray(match.cards)) return;

        match.cards.forEach(item => {

            const name =
                typeof item === "string"
                    ? item
                    : item.player || item.name;

            if (!name) return;

            const type =
                typeof item === "object"
                    ? item.type || "yellow"
                    : "yellow";

            if (!stats[name]) {
                stats[name] = {
                    yellow: 0,
                    red: 0
                };
            }

            if (type === "red") {
                stats[name].red++;
            } else {
                stats[name].yellow++;
            }
        });
    });

    const list = Object.entries(stats);

    if (list.length === 0) {
        container.innerHTML = `
            <li>
                لا توجد بطاقات مسجلة حاليًا.
            </li>
        `;

        return;
    }

    container.innerHTML = list
        .map(([name, cards]) => `
            <li>
                <span>${escapeHtml(name)}</span>
                <span>
                    🟨 ${cards.yellow}
                    &nbsp;
                    🟥 ${cards.red}
                </span>
            </li>
        `)
        .join("");
}


/* =========================
   المباراة القادمة
   ========================= */

function renderNextMatch() {
    const container = document.getElementById("nextMatch");

    if (!container) return;

    const matches = Array.isArray(leagueData.matches)
        ? leagueData.matches
        : [];

    const upcoming = matches
        .filter(match => match.status !== "finished")
        .filter(match => match.date)
        .sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        )[0];

    if (!upcoming) {
        container.textContent =
            "لا توجد مباراة قادمة حاليًا.";

        return;
    }

    container.innerHTML = `
        <div style="text-align:center">

            <strong>
                ${escapeHtml(upcoming.team1 || "")}
            </strong>

            <span> × </span>

            <strong>
                ${escapeHtml(upcoming.team2 || "")}
            </strong>

            <br>

            <span>
                ${formatDate(upcoming.date)}
            </span>

        </div>
    `;
}


/* =========================
   البحث عن فريق
   ========================= */

function getTeam(name) {
    if (!Array.isArray(leagueData.teams)) {
        return null;
    }

    return leagueData.teams.find(
        team => team.name === name
    ) || null;
}


/* =========================
   التاريخ
   ========================= */

function formatDate(value) {
    if (!value) return "بدون تاريخ";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return escapeHtml(String(value));
    }

    return date.toLocaleString(
        "ar-YE",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* =========================
   الوضع الليلي
   ========================= */

function setupTheme() {
    const button = document.getElementById("themeButton");

    if (!button) return;

    button.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
}


/* =========================
   حماية النصوص
   ========================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHtml(value);
}
