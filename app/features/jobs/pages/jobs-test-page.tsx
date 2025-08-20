import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { useState } from "react";
import type { Route } from "./+types/jobs-test-page";
import { 
  Calendar,
  Clock,
  RefreshCw,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { makeSSRClient } from "~/supa-client";
import { 
  getQuestsForDate, 
  getQuestSummaryForDate, 
  getQuestHistoryForDateRange 
} from "../queries";

export const meta = () => {
  return [
    { title: "Quest Test | dotLife" },
    {
      name: "description",
      content: "Test quest system with different dates",
    },
  ];
};

export default function QuestTestPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quests, setQuests] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to get relative date
  const getRelativeDate = (daysOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  // Load data for selected date
  const loadDataForDate = async (date: string) => {
    setLoading(true);
    try {
      // Simulate request object
      const mockRequest = new Request('http://localhost:3000');
      
      const [questsData, summaryData, historyData] = await Promise.all([
        getQuestsForDate(mockRequest, date),
        getQuestSummaryForDate(mockRequest, date),
        getQuestHistoryForDateRange(mockRequest, getRelativeDate(-7), date)
      ]);

      setQuests(questsData || []);
      setSummary(summaryData);
      setHistory(historyData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    loadDataForDate(newDate);
  };

  // Quick date buttons
  const quickDates = [
    { label: 'Today', date: new Date().toISOString().split('T')[0] },
    { label: 'Yesterday', date: getRelativeDate(-1) },
    { label: '2 days ago', date: getRelativeDate(-2) },
    { label: '3 days ago', date: getRelativeDate(-3) },
    { label: 'Tomorrow', date: getRelativeDate(1) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quest System Test</h1>
          <p className="text-gray-600">Test the quest system with different dates</p>
        </div>

        {/* Date Selector */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-48"
              />
              <Button 
                onClick={() => loadDataForDate(selectedDate)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Load Data
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {quickDates.map(({ label, date }) => (
                <Button
                  key={date}
                  variant={selectedDate === date ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDateChange(date)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Date Display */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {formatDate(selectedDate)}
              </h2>
              <p className="text-gray-600">
                {selectedDate === new Date().toISOString().split('T')[0] 
                  ? 'Current Date' 
                  : 'Simulated Date'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quests for Selected Date */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Quests for {formatDate(selectedDate)}</CardTitle>
          </CardHeader>
          <CardContent>
            {quests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quests.map((quest) => (
                  <div key={quest.quest_id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{quest.title}</h3>
                      <Badge variant="outline">{quest.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>+{quest.reward_xp} XP</span>
                      <span className={`${quest.completed ? 'text-green-600' : 'text-gray-400'}`}>
                        {quest.completed ? 'Completed' : 'Not completed'}
                      </span>
                    </div>
                    {quest.hours_remaining > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        {quest.hours_remaining}h {quest.minutes_remaining}m remaining
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No quests for this date</p>
            )}
          </CardContent>
        </Card>

        {/* Summary for Selected Date */}
        {summary && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Summary for {formatDate(selectedDate)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{summary.completed_quests}/{summary.total_quests}</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">+{summary.total_xp_earned}</div>
                  <div className="text-sm text-gray-500">XP Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{summary.total_bricks_earned}</div>
                  <div className="text-sm text-gray-500">Bricks Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{summary.completion_percentage || 0}%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quest History (Last 7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((dayRecord) => (
                  <div key={dayRecord.quest_date} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{dayRecord.formatted_date}</h3>
                        <p className="text-sm text-gray-500">{dayRecord.day_name}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold">{dayRecord.completed_quests}/{dayRecord.total_quests}</div>
                          <div className="text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">+{dayRecord.total_xp_earned}</div>
                          <div className="text-gray-500">XP</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">+{dayRecord.total_bricks_earned}</div>
                          <div className="text-gray-500">Bricks</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 