/* =========================================
   بيانات دوري ميدي للمحترفين 2026
   الملف: js/data.js
   ========================================= */

const INITIAL_DATA = {
    teams: [],
    players: {},
    matches: [],
    news: []
};


/* =========================
   تحويل بيانات Supabase
   ========================= */

function normalizeLeagueData(rawData) {
    if (!rawData) {
        return {
            teams: [],
            players: {},
            matches: [],
            news: []
        };
    }

    let data = rawData;

    // إذا كانت البيانات نصًا JSON نحاول تحويلها
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (error) {
            console.error("تعذر قراءة بيانات الدوري:", error);

            return {
                teams: [],
                players: {},
                matches: [],
                news: []
            };
        }
    }

    return {
        teams: Array.isArray(data.teams)
            ? data.teams
            : [],

        players:
            data.players &&
            typeof data.players === "object"
                ? data.players
                : {},

        matches: Array.isArray(data.matches)
            ? data.matches
            : [],

        news: Array.isArray(data.news)
            ? data.news
            : []
    };
}
