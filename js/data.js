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
   تجهيز بيانات الدوري
   ========================= */

function normalizeLeagueData(rawData) {

    if (!rawData) {
        return { ...INITIAL_DATA };
    }

    let data = rawData;

    // بيانات Supabase قد تصل كنص JSON
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


    const teams = Array.isArray(data.teams)
        ? data.teams
        : [];

    const players =
        data.players &&
        typeof data.players === "object"
            ? data.players
            : {};

    const matches = Array.isArray(data.matches)
        ? data.matches
        : [];

    const news = Array.isArray(data.news)
        ? data.news.map(item => ({
            ...item,

            // توحيد اسم نص الخبر
            text:
                item.text ??
                item.content ??
                ""
        }))
        : [];


    /*
     * ربط لاعبي كل فريق بالفريق نفسه
     *
     * مثال:
     * الفرق موجودة في data.teams
     * واللاعبون موجودون في data.players
     *
     * لذلك نضيف اللاعبين إلى كل فريق
     */

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


    return {
        teams: normalizedTeams,
        players,
        matches,
        news
    };
}
