import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// ربط مشروع Supabase الخاص بك
const SUPABASE_URL = 'https://ptmochzprrdkjodcqefn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FEU0T7YfBpXCIE4puwa8UQ_binTsdgX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function NewLeagueApp() {
  const [activeTab, setActiveTab] = useState('matches');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // شعار البطولة الجديد
  const leagueLogo = 'https://i.postimg.cc/xC7qTMXK/IMG-20260829-232623.png';

  // قائمة الفرق الافتراضية للبطولة الجديدة
  const [teams, setTeams] = useState([
    {
      name: 'فريق أ',
      logo: 'https://via.placeholder.com/100',
      players: ['لاعب 1', 'لاعب 2', 'لاعب 3']
    },
    {
      name: 'فريق ب',
      logo: 'https://via.placeholder.com/100',
      players: ['لاعب 1', 'لاعب 2', 'لاعب 3']
    }
  ]);

  // جدول المباريات
  const [matches, setMatches] = useState([
    {
      id: '1',
      date: '2026-09-01',
      homeTeam: 'فريق أ',
      awayTeam: 'فريق ب',
      homeGoals: 0,
      awayGoals: 0,
      played: false
    }
  ]);

  // الأخبار
  const [news, setNews] = useState([
    {
      id: '1',
      title: 'انطلاق البطولة الجديدة',
      content: 'مرحباً بكم في منافسات البطولة الجديدة.',
      date: '2026-09-01'
    }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // القراءة من الجدول الجديد new_league_data
      const { data, error } = await supabase
        .from('new_league_data')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.log('Load error:', error.message);
      }

      if (data) {
        if (Array.isArray(data.teams) && data.teams.length > 0) setTeams(data.teams);
        if (Array.isArray(data.matches) && data.matches.length > 0) setMatches(data.matches);
        if (Array.isArray(data.news) && data.news.length > 0) setNews(data.news);
      }
    } catch (error) {
      console.log('Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveData(newMatches = matches) {
    try {
      // الحفظ في الجدول الجديد new_league_data
      const { error } = await supabase
        .from('new_league_data')
        .upsert({
          id: 1,
          teams: teams,
          matches: newMatches,
          news: news,
          updated_at: new Date().toISOString()
        });

      if (error) {
        alert('خطأ في الحفظ: ' + error.message);
        return;
      }
      alert('تم الحفظ وتحديث البيانات بنجاح!');
    } catch (error) {
      alert('حدث خطأ في الاتصال بقاعدة البيانات');
    }
  }

  function updateMatchScore(index, field, value) {
    const updatedMatches = [...matches];
    updatedMatches[index] = {
      ...updatedMatches[index],
      [field]: Math.max(0, Number(value) || 0)
    };
    setMatches(updatedMatches);
  }

  function markMatchAsPlayed(index) {
    const updatedMatches = [...matches];
    updatedMatches[index] = { ...updatedMatches[index], played: true };
    setMatches(updatedMatches);
    saveData(updatedMatches);
  }

  const standings = teams
    .map((team) => ({
      name: team.name,
      logo: team.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    }))
    .map((team) => {
      const teamMatches = matches.filter(
        (match) => match.played && (match.homeTeam === team.name || match.awayTeam === team.name)
      );

      const result = { ...team };

      teamMatches.forEach((match) => {
        const homeGoals = Number(match.homeGoals) || 0;
        const awayGoals = Number(match.awayGoals) || 0;

        result.played += 1;

        if (match.homeTeam === team.name) {
          result.goalsFor += homeGoals;
          result.goalsAgainst += awayGoals;
          if (homeGoals > awayGoals) {
            result.won += 1;
            result.points += 3;
          } else if (homeGoals === awayGoals) {
            result.drawn += 1;
            result.points += 1;
          } else {
            result.lost += 1;
          }
        } else if (match.awayTeam === team.name) {
          result.goalsFor += awayGoals;
          result.goalsAgainst += homeGoals;
          if (awayGoals > homeGoals) {
            result.won += 1;
            result.points += 3;
          } else if (awayGoals === homeGoals) {
            result.drawn += 1;
            result.points += 1;
          } else {
            result.lost += 1;
          }
        }
      });

      result.goalDifference = result.goalsFor - result.goalsAgainst;
      return result;
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.name.localeCompare(b.name, 'ar');
    });

  return (
    <div dir="rtl" className={darkMode ? 'bg-gray-900 text-white min-h-screen pb-20' : 'bg-gray-50 text-gray-900 min-h-screen pb-20'}>
      {/* Header */}
      <header className="bg-emerald-700 text-white p-4 shadow flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={leagueLogo} alt="شعار الدوري" className="w-9 h-9 object-contain bg-white rounded-full p-1" />
          <div>
            <h1 className="font-bold text-sm">البطولة الجديدة</h1>
            <p className="text-[10px] text-emerald-200">2026</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="p-1 bg-emerald-800 rounded text-xs px-2">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setIsAdmin(!isAdmin)} className="bg-amber-500 text-gray-900 px-2 py-1 rounded font-bold text-xs">
            ⚙️ الإدارة
          </button>
        </div>
      </header>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="p-3 bg-gray-800 border-b border-gray-700 m-2 rounded">
          <h2 className="font-bold text-sm mb-2 text-amber-400">لوحة الإدارة</h2>
          <input
            type="password"
            placeholder="أدخل رمز الأمان (aymanmidi)"
            value={adminPin}
            onChange={(e) => setAdminPin(e.target.value)}
            className="p-2 rounded bg-gray-900 text-white border border-gray-700 text-xs w-full mb-2"
          />

          {adminPin === 'aymanmidi' && (
            <div className="mt-2 max-h-60 overflow-y-auto">
              <p className="text-xs text-emerald-400 mb-2">تعديل النتائج:</p>
              {matches.map((match, index) => (
                <div key={match.id} className="flex items-center justify-between gap-1 mb-2 bg-gray-900 p-2 rounded text-xs">
                  <span className="w-16 truncate">{match.homeTeam}</span>
                  <input
                    type="number"
                    min="0"
                    value={match.homeGoals}
                    onChange={(e) => updateMatchScore(index, 'homeGoals', e.target.value)}
                    className="w-10 text-center bg-gray-800 text-white rounded p-1"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min="0"
                    value={match.awayGoals}
                    onChange={(e) => updateMatchScore(index, 'awayGoals', e.target.value)}
                    className="w-10 text-center bg-gray-800 text-white rounded p-1"
                  />
                  <span className="w-16 truncate text-left">{match.awayTeam}</span>
                  <button onClick={() => markMatchAsPlayed(index)} className="bg-blue-600 px-2 py-1 rounded text-white text-[10px]">
                    حفظ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <main className="p-4 max-w-md mx-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">جاري تحميل البيانات...</div>
        ) : (
          <>
            {activeTab === 'matches' && (
              <div>
                <h2 className="font-bold text-base mb-3 border-b pb-1">📅 جدول المباريات</h2>
                {matches.map((match) => (
                  <div key={match.id} className={`p-3 mb-2 rounded shadow border text-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                      <span>المباراة #{match.id}</span>
                      <span>{match.date}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span>{match.homeTeam}</span>
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs">
                        {match.played ? `${match.homeGoals} - ${match.awayGoals}` : 'VS'}
                      </span>
                      <span>{match.awayTeam}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'teams' && (
              <div>
                <h2 className="font-bold text-base mb-3 border-b pb-1">🛡️ الفرق واللاعبين</h2>
                {teams.map((team, index) => (
                  <div key={index} className={`p-3 mb-3 rounded shadow border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain bg-black/20 rounded p-0.5" />
                      <h3 className="font-bold text-sm">{team.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {team.players.map((player, pIndex) => (
                        <div key={pIndex} className={`p-1 rounded ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          ⚽ {player}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'news' && (
              <div>
                <h2 className="font-bold text-base mb-3 border-b pb-1">📰 الأخبار</h2>
                {news.map((item) => (
                  <div key={item.id} className={`p-3 mb-2 rounded shadow border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="font-bold text-emerald-400 text-xs mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-300 mb-1">{item.content}</p>
                    <span className="text-[10px] text-gray-500">{item.date}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'standings' && (
              <div>
                <h2 className="font-bold text-base mb-3 border-b pb-1">🏆 جدول الترتيب</h2>
                <div className={`rounded shadow border overflow-x-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <table className="w-full text-[10px] text-center">
                    <thead className={darkMode ? 'bg-gray-900 text-emerald-400' : 'bg-gray-100 text-emerald-700'}>
                      <tr>
                        <th className="p-2">م</th>
                        <th className="p-2 text-right">الفريق</th>
                        <th className="p-2">ل</th>
                        <th className="p-2">ف</th>
                        <th className="p-2">ت</th>
                        <th className="p-2">خ</th>
                        <th className="p-2">له</th>
                        <th className="p-2">عليه</th>
                        <th className="p-2">+/-</th>
                        <th className="p-2">ن</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={team.name} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className="p-2 font-bold">{index + 1}</td>
                          <td className="p-2 text-right">
                            <div className="flex items-center gap-1 min-w-[90px]">
                              <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
                              <span>{team.name}</span>
                            </div>
                          </td>
                          <td className="p-2">{team.played}</td>
                          <td className="p-2 text-emerald-400">{team.won}</td>
                          <td className="p-2">{team.drawn}</td>
                          <td className="p-2">{team.lost}</td>
                          <td className="p-2">{team.goalsFor}</td>
                          <td className="p-2">{team.goalsAgainst}</td>
                          <td className={`p-2 font-bold ${team.goalDifference > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                          </td>
                          <td className="p-2 font-bold text-amber-400">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t flex justify-around p-2 text-xs font-bold ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
        <button onClick={() => setActiveTab('matches')} className={activeTab === 'matches' ? 'text-emerald-500' : ''}>📅 المباريات</button>
        <button onClick={() => setActiveTab('standings')} className={activeTab === 'standings' ? 'text-emerald-500' : ''}>🏆 الترتيب</button>
        <button onClick={() => setActiveTab('news')} className={activeTab === 'news' ? 'text-emerald-500' : ''}>📰 الأخبار</button>
        <button onClick={() => setActiveTab('teams')} className={activeTab === 'teams' ? 'text-emerald-500' : ''}>🛡️ الفرق</button>
      </nav>
    </div>
  );
}
