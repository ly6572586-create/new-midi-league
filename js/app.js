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

    const selectedSection =
        document.getElementById(sections[tab]);

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
   تحميل البيانات من Supabase
   ========================= */

async function loadLeagueData() {

    try {

        const { data, error } = await supabaseClient
            .from("new_league_data")
            .select("data")
            .eq("id", 1)
            .maybeSingle();


        if (error) {

            console.error(
                "خطأ في تحميل بيانات الدوري:",
                error
            );

            showDatabaseError(error);

            return;
        }


        if (!data || !data.data) {

            console.error(
                "لم يتم العثور على بيانات الدوري."
            );

            showDatabaseError(
                "لم يتم العثور على بيانات الدوري."
            );

            return;
        }


        /*
         * مهم:
         *
         * العمود data في Supabase يحتوي
         * على JSON.
         *
         * normalizeLeagueData تقوم بتحويله
         * وتجهيز الفرق واللاعبين والمباريات
         * والأخبار بالشكل الذي يحتاجه الموقع.
         */

        leagueData = normalizeLeagueData(data.data);


        console.log(
            "تم تحميل بيانات الدوري:",
            leagueData
        );


        renderAll();


    } catch (error) {

        console.error(
            "حدث خطأ غير متوقع:",
            error
        );

        showDatabaseError(error);
    }
}


/* =========================
   رسالة خطأ قاعدة البيانات
   ========================= */

function showDatabaseError(error) {

    const message =
        error?.message ||
        String(error) ||
        "خطأ غير معروف";


    const containers = [
        "matches",
        "standings",
        "news",
        "teams",
        "scorers"
    ];


    containers.forEach(id => {

        const container =
            document.getElementById(id);

        if (!container) return;


        container.innerHTML = `
            <div class="card">
                <div class="alert alert-danger">
                    تعذر تحميل بيانات الدوري من قاعدة البيانات.
                </div>

                <div>
                    ${escapeHtml(message)}
                </div>
            </div>
        `;
    });


    const nextMatch =
        document.getElementById("nextMatch");

    if (nextMatch) {

        nextMatch.innerHTML = `
            <div class="alert alert-danger">
                تعذر تحميل بيانات المباراة القادمة.
            </div>
        `;
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

    const container =
        document.getElementById("matches");

    if (!container) return;


    const matches =
        Array.isArray(leagueData.matches)
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


    const sortedMatches =
        [...matches].sort((a, b) => {

            return (
                getMatchDate(a.date) -
                getMatchDate(b.date)
            );
        });


    container.innerHTML =
        sortedMatches
            .map(match => {

                const team1 =
                    getTeam(match.team1);

                const team2 =
                    getTeam(match.team2);


                const team1Name =
                    team1?.name ||
                    match.team1 ||
                    "الفريق الأول";


                const team2Name =
                    team2?.name ||
                    match.team2 ||
                    "الفريق الثاني";


                const team1Logo =
                    team1?.logo || "";


                const team2Logo =
                    team2?.logo || "";


                const finished =
                    match.status === "finished";


                const score =
                    finished
                        ? `${Number(match.score1 ?? 0)} - ${Number(match.score2 ?? 0)}`
                        : "VS";


                return `
                    <article class="match-card">

                        <div class="match-top">

                            <div class="match-date">
                                ${formatMatchDate(match.date)}

                                ${
                                    match.time
                                        ? `<br>${escapeHtml(match.time)}`
                                        : ""
                                }
                            </div>

                            <div class="round">
                                ${escapeHtml(
                                    match.stage ||
                                    "مباراة"
                                )}
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

                                <div class="${
                                    finished
                                        ? "score"
                                        : "vs"
                                }">

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


/* =========================
   أحداث المباراة
   ========================= */

function renderMatchEvents(match) {

    const events = [];


    /*
     * الأهداف
     */

    if (Array.isArray(match.scorers)) {

        match.scorers.forEach(item => {

            if (!item) return;


            const player =
                typeof item === "string"
                    ? item
                    : item.name ||
                      item.player ||
                      "";


            const goals =
                typeof item === "object"
                    ? Number(item.goals || 1)
                    : 1;


            if (player) {

                events.push(
                    `⚽ ${escapeHtml(player)}${
                        goals > 1
                            ? ` × ${goals}`
                            : ""
                    }`
                );
            }
        });
    }


    /*
     * البطاقات
     */

    if (Array.isArray(match.cards)) {

        match.cards.forEach(item => {

            if (!item) return;


            const player =
                typeof item === "string"
                    ? item
                    : item.name ||
                      item.player ||
                      "";


            const type =
                typeof item === "object"
                    ? item.type || "yellow"
                    : "yellow";


            if (!player) return;


            events.push(
                `${
                    type === "red"
                        ? "🟥"
                        : "🟨"
                } ${escapeHtml(player)}`
            );
        });
    }


    /*
     * تفاصيل المباراة
     */

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

            <h3>
                أحداث المباراة
            </h3>

            ${events
                .map(event =>
                    `<div class="event">${event}</div>`
                )
                .join("")}

        </div>
    `;
}


/* =========================
   جدول الترتيب
   ========================= */

function renderStandings() {

    const container =
        document.getElementById("standings");

    if (!container) return;


    const teams =
        Array.isArray(leagueData.teams)
            ? leagueData.teams
            : [];


    const matches =
        Array.isArray(leagueData.matches)
            ? leagueData.matches
            : [];


    const table =
        teams.map(team => ({

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

        /*
         * نحسب المباريات المنتهية فقط.
         */

        if (
            match.status !== "finished"
        ) {
            return;
        }


        if (
            match.score1 === undefined ||
            match.score2 === undefined
        ) {
            return;
        }


        const home =
            table.find(
                item =>
                    item.team.name ===
                    match.team1
            );


        const away =
            table.find(
                item =>
                    item.team.name ===
                    match.team2
            );


        if (!home || !away) {
            return;
        }


        const s1 =
            Number(match.score1);


        const s2 =
            Number(match.score2);


        if (
            Number.isNaN(s1) ||
            Number.isNaN(s2)
        ) {
            return;
        }


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

        const gdA =
            a.gf - a.ga;


        const gdB =
            b.gf - b.ga;


        return (
            b.points - a.points ||
            gdB - gdA ||
            b.gf - a.gf
        );
    });


    container.innerHTML =
        table
            .map((item, index) => {

                const gd =
                    item.gf - item.ga;


                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.team.name
                            )}
                        </td>

                        <td>
                            ${item.played}
                        </td>

                        <td>
                            ${item.wins}
                        </td>

                        <td>
                            ${item.draws}
                        </td>

                        <td>
                            ${item.losses}
                        </td>

                        <td>
                            ${item.gf}
                        </td>

                        <td>
                            ${item.ga}
                        </td>

                        <td>
                            ${
                                gd > 0
                                    ? "+"
                                    : ""
                            }${gd}
                        </td>

                        <td>
                            <strong>
                                ${item.points}
                            </strong>
                        </td>

                    </tr>
                `;
            })
            .join("");
}


/* =========================
   الفرق واللاعبون
   ========================= */

function renderTeams() {

    const container =
        document.getElementById("teams");

    if (!container) return;


    const teams =
        Array.isArray(leagueData.teams)
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


    container.innerHTML =
        teams
            .map(team => {

                const players =
                    Array.isArray(team.players)
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
                                    ${escapeHtml(
                                        team.name
                                    )}
                                </strong>

                                <div>
                                    ${players.length}
                                    لاعب
                                </div>

                            </div>

                        </div>


                        <div class="players">

                            ${
                                players.length
                                    ? players
                                        .map(player => {

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
                                                        ${escapeHtml(
                                                            playerName
                                                        )}
                                                    </div>

                                                </div>
                                            `;

                                        })
                                        .join("")
                                    : `
                                        <div>
                                            لا يوجد لاعبين.
                                        </div>
                                    `
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

    const container =
        document.getElementById("news");

    if (!container) return;


    const news =
        Array.isArray(leagueData.news)
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


    container.innerHTML =
        news
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


                if (item.videoUrl) {

                    media += `
                        <video
                            src="${escapeAttribute(item.videoUrl)}"
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
                                ${escapeHtml(
                                    item.title ||
                                    "خبر"
                                )}
                            </h3>

                            <div class="news-text">
                                ${escapeHtml(
                                    item.text ||
                                    item.content ||
                                    ""
                                )}
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

    const container =
        document.getElementById("scorers");

    if (!container) return;


    /*
     * نستخدم player_stats إذا كانت
     * موجودة داخل البيانات الرئيسية.
     *
     * وإذا لم تكن موجودة نحسب الأهداف
     * من المباريات.
     */

    const stats = {};


    if (
        Array.isArray(leagueData.player_stats)
    ) {

        leagueData.player_stats.forEach(item => {

            if (!item || !item.name) {
                return;
            }


            const goals =
                Number(item.goals || 0);


            stats[item.name] =
                (stats[item.name] || 0) +
                goals;
        });
    }


    /*
     * حساب الأهداف من المباريات أيضًا.
     */

    const matches =
        Array.isArray(leagueData.matches)
            ? leagueData.matches
            : [];


    matches.forEach(match => {

        if (!Array.isArray(match.scorers)) {
            return;
        }


        match.scorers.forEach(item => {

            if (!item) return;


            const name =
                typeof item === "string"
                    ? item
                    : item.name ||
                      item.player;


            if (!name) return;


            /*
             * إذا كانت player_stats موجودة
             * فلا نكرر الهدف الموجود فيها.
             *
             * لذلك نحسب من المباريات فقط
             * عندما لا توجد إحصائيات.
             */

            if (
                !Array.isArray(
                    leagueData.player_stats
                )
            ) {

                const goals =
                    typeof item === "object"
                        ? Number(item.goals || 1)
                        : 1;


                stats[name] =
                    (stats[name] || 0) +
                    goals;
            }
        });
    });


    const list =
        Object.entries(stats)
            .sort((a, b) => b[1] - a[1]);


    if (list.length === 0) {

        container.innerHTML = `
            <li>
                لا توجد أهداف مسجلة حاليًا.
            </li>
        `;

        return;
    }


    container.innerHTML =
        list
            .map(([name, goals]) => `
                <li>

                    <span>
                        ${escapeHtml(name)}
                    </span>

                    <strong>
                        ${goals}
                    </strong>

                </li>
            `)
            .join("");
}


/* =========================
   البطاقات
   ========================= */

function renderCards() {

    const container =
        document.getElementById("cards");

    if (!container) return;


    const stats = {};


    /*
     * إذا كانت player_stats موجودة
     * نستخدمها مباشرة.
     */

    if (
        Array.isArray(leagueData.player_stats)
    ) {

        leagueData.player_stats.forEach(item => {

            if (!item || !item.name) {
                return;
            }


            stats[item.name] = {

                yellow:
                    Number(
                        item.yellow_cards || 0
                    ),

                red:
                    Number(
                        item.red_cards || 0
                    )
            };
        });
    }


    /*
     * وإذا لم تكن player_stats موجودة
     * نحسب البطاقات من المباريات.
     */

    if (
        !Array.isArray(
            leagueData.player_stats
        )
    ) {

        const matches =
            Array.isArray(leagueData.matches)
                ? leagueData.matches
                : [];


        matches.forEach(match => {

            if (!Array.isArray(match.cards)) {
                return;
            }


            match.cards.forEach(item => {

                if (!item) return;


                const name =
                    typeof item === "string"
                        ? item
                        : item.name ||
                          item.player;


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
    }


    const list =
        Object.entries(stats);


    if (list.length === 0) {

        container.innerHTML = `
            <li>
                لا توجد بطاقات مسجلة حاليًا.
            </li>
        `;

        return;
    }


    container.innerHTML =
        list
            .map(([name, cards]) => `
                <li>

                    <span>
                        ${escapeHtml(name)}
                    </span>

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

    const container =
        document.getElementById("nextMatch");

    if (!container) return;


    const matches =
        Array.isArray(leagueData.matches)
            ? leagueData.matches
            : [];


    const upcoming =
        matches
            .filter(match =>
                match.status !== "finished"
            )
            .filter(match => match.date)
            .sort((a, b) =>
                getMatchDate(a.date) -
                getMatchDate(b.date)
            )[0];


    if (!upcoming) {

        container.textContent =
            "لا توجد مباراة قادمة حاليًا.";

        return;
    }


    container.innerHTML = `
        <div style="text-align:center">

            <strong>
                ${escapeHtml(
                    upcoming.team1 || ""
                )}
            </strong>

            <span>
                ×
            </span>

            <strong>
                ${escapeHtml(
                    upcoming.team2 || ""
                )}
            </strong>

            <br>

            <span>
                ${formatMatchDate(
                    upcoming.date
                )}

                ${
                    upcoming.time
                        ? ` - ${escapeHtml(upcoming.time)}`
                        : ""
                }
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
   تحويل التاريخ
   ========================= */

function getMatchDate(value) {

    if (!value) {
        return Number.MAX_SAFE_INTEGER;
    }


    /*
     * أولًا نحاول التاريخ العادي.
     */

    const normalDate =
        new Date(value);


    if (
        !Number.isNaN(
            normalDate.getTime()
        )
    ) {

        return normalDate.getTime();
    }


    /*
     * معالجة التواريخ العربية الموجودة
     * حاليًا في قاعدة البيانات.
     *
     * مثال:
     * 28 أغسطس 2026
     */

    const months = {

        "يناير": 0,
        "فبراير": 1,
        "مارس": 2,
        "أبريل": 3,
        "مايو": 4,
        "يونيو": 5,
        "يوليو": 6,
        "أغسطس": 7,
        "سبتمبر": 8,
        "أكتوبر": 9,
        "نوفمبر": 10,
        "ديسمبر": 11

    };


    const match =
        String(value).match(
            /(\d{1,2})\s+([^\s]+)\s+(\d{4})/
        );


    if (!match) {

        return Number.MAX_SAFE_INTEGER;
    }


    const day =
        Number(match[1]);


    const month =
        months[match[2]];


    const year =
        Number(match[3]);


    if (
        month === undefined ||
        Number.isNaN(day) ||
        Number.isNaN(year)
    ) {

        return Number.MAX_SAFE_INTEGER;
    }


    return new Date(
        year,
        month,
        day
    ).getTime();
}


/* =========================
   عرض التاريخ
   ========================= */

function formatMatchDate(value) {

    if (!value) {
        return "بدون تاريخ";
    }


    /*
     * إذا كان التاريخ عربيًا،
     * نعرضه كما هو بدل محاولة
     * تحويله إلى تاريخ غير صالح.
     */

    const parsed =
        getMatchDate(value);


    if (
        parsed === Number.MAX_SAFE_INTEGER
    ) {

        return escapeHtml(
            String(value)
        );
    }


    const date =
        new Date(parsed);


    return date.toLocaleDateString(
        "ar-YE",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* =========================
   الوضع الليلي
   ========================= */

function setupTheme() {

    const button =
        document.getElementById(
            "themeButton"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );
        }
    );
}


/* =========================
   حماية النصوص
   ========================= */

function escapeHtml(value) {

    return String(value ?? "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


function escapeAttribute(value) {

    return escapeHtml(value);
}
