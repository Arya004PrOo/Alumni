import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { fetchAlumniPerCompany, fetchAlumniPerYear, AnalyticsData, Alumni } from "../lib/api";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#14b8a6'];

interface Props {
  alumni: Alumni[];
}

export function AnalyticsCharts({ alumni }: Props) {
  const [companyData, setCompanyData] = useState<AnalyticsData[]>([]);
  const [yearData, setYearData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Distribution calculation
  const categoryData = useMemo(() => {
    if (alumni.length === 0) return [];
    const counts: Record<string, number> = {};
    alumni.forEach(a => {
      const cat = a.company_type || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / alumni.length) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);
  }, [alumni]);

  // Top Hiring Companies calculation
  const topHiringCompanies = useMemo(() => {
    if (alumni.length === 0) return [];
    const counts: Record<string, number> = {};
    alumni.forEach(a => {
      if (a.company) {
        const comp = a.company.trim();
        counts[comp] = (counts[comp] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [alumni]);

  // Skill Diversity calculation
  const skillData = useMemo(() => {
    if (alumni.length === 0) return [];
    const counts: Record<string, number> = {};
    alumni.forEach(a => {
      if (a.skills) {
        a.skills.split(',').forEach(s => {
          const skill = s.trim();
          if (skill) counts[skill] = (counts[skill] || 0) + 1;
        });
      }
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [alumni]);

  useEffect(() => {
    async function loadData() {
      try {
        const yr = await fetchAlumniPerYear();
        setYearData(yr);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="erp-alert erp-alert--info">Loading analytics...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 32 }}>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 28 }}>
        {/* Industry Distribution Chart */}
        <div className="erp-card erp-animate-in">
          <div className="erp-card__header">
            <div>
              <div className="erp-card__title">Industry Distribution</div>
              <div className="erp-card__subtitle">Career sectors by percentage</div>
            </div>
          </div>
          <div className="erp-card__body" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} Alumni (${props.payload.percentage}%)`, name]}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={80} 
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span style={{ color: '#4b5563', fontSize: 13, fontWeight: 500 }}>
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Hiring Companies Horizontal Bar Chart */}
        <div className="erp-card erp-animate-in" style={{ animationDelay: "100ms" }}>
          <div className="erp-card__header">
            <div>
              <div className="erp-card__title">Top Hiring Partners</div>
              <div className="erp-card__subtitle">Organizations with highest alumni count</div>
            </div>
          </div>
          <div className="erp-card__body" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topHiringCompanies}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#374151', fontSize: 13, fontWeight: 600}} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="var(--erp-primary)" 
                  radius={[0, 6, 6, 0]} 
                  name="Alumni Count"
                  barSize={24}
                >
                  {topHiringCompanies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 28 }}>
        {/* Alumni per Year Bar Chart */}
        <div className="erp-card erp-animate-in" style={{ animationDelay: "200ms" }}>
          <div className="erp-card__header">
            <div>
              <div className="erp-card__title">Annual Graduation Trend</div>
              <div className="erp-card__subtitle">Alumni registration growth over time</div>
            </div>
          </div>
          <div className="erp-card__body" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="var(--erp-primary)" radius={[6, 6, 0, 0]} name="Alumni" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Diversity Radar Chart */}
        <div className="erp-card erp-animate-in" style={{ animationDelay: "300ms" }}>
          <div className="erp-card__header">
            <div>
              <div className="erp-card__title">Skill Diversity Ecosystem</div>
              <div className="erp-card__subtitle">Top competencies across the network</div>
            </div>
          </div>
          <div className="erp-card__body" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                <defs>
                  <linearGradient id="colorSkill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" gridType="polygon" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: '#1e293b', fontSize: 13, fontWeight: 700 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                
                {/* Outer Glow/Shadow Radar */}
                <Radar
                  name="Proficiency"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#colorSkill)"
                  fillOpacity={0.6}
                  dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                />
                
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 16, 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  formatter={(value) => [value, "Alumni Experts"]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
