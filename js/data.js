/* =========================================
   بيانات دوري ميدي للمحترفين 2026
   الملف: js/data.js
   ========================================= */


/* =========================
   البيانات الافتراضية
   ========================= */

const INITIAL_DATA = {

    /* إعدادات الموقع */
    settings: {
        leagueName: "دوري ميدي للمحترفين",
        season: "2026",

        logo: "https://i.postimg.cc/xC7qTMXK/IMG-20260829-232623.png",

        heroTitle: "دوري ميدي",
        heroSubtitle: "للمحترفين",

        description:
            "أكثر من مجرد دوري... إنها أسطورة"
    },


    /* الأندية */
    teams: [],


    /* اللاعبين */
    players: {},


    /* المباريات */
    matches: [],


    /* الأخبار */
    news: []
};


/* =========================
   تجهيز بيانات الدوري
   ========================= */

function normalizeLeagueData(rawData) {

    if (!rawData) {
        return { ...INITIAL_DATA };
    }


    let data = rawData;


    /* =========================
       تحويل JSON إلى Object
       ========================= */

    if (typeof data === "string") {

        try {

            data = JSON.parse(data);

        } catch (error) {

            console.error(
                "خطأ في تحويل بيانات الدوري:",
                error
            );

            return { ...INITIAL_DATA };
        }
    }


    /* =========================
       إعدادات الموقع
       ========================= */

    const defaultSettings = {
        ...INITIAL_DATA.settings
    };

    const settings =
        data.settings &&
        typeof data.settings === "object"
            ? {
                ...defaultSettings,
                ...data.settings
            }
            : defaultSettings;


    /* =========================
       الأندية
       ========================= */

    const teams = Array.isArray(data.teams)
        ? data.teams
        : [];


    /* =========================
       اللاعبين
       ========================= */

    const players =
        data.players &&
        typeof data.players === "object"
            ? data.players
            : {};


    /* =========================
       المباريات
       ========================= */

    const matches = Array.isArray(data.matches)
        ? data.matches
        : [];


    /* =========================
       الأخبار
       ========================= */

    const news = Array.isArray(data.news)

        ? data.news.map(item => ({

            ...item,

            /* توحيد اسم نص الخبر */
            text:
                item.text ??
                item.content ??
                ""

        }))

        : [];


    /* =========================
       ربط اللاعبين بالأندية
       ========================= */

    const normalizedTeams = teams.map(team => {

        const teamPlayers =
            Array.isArray(players[team.id])
                ? players[team.id]
                : [];


        return {

            ...team,

            players: teamPlayers

        };

    });


    /* =========================
       البيانات النهائية
       ========================= */

    return {

        settings,

        teams: normalizedTeams,

        players,

        matches,

        news

    };
}
