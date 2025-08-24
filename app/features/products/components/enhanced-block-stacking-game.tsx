"use client";

import { useRef, useState, useEffect } from "react";
import { Calendar } from "~/common/components/ui/calendar";
import { format } from "date-fns";
import { HexColorPicker } from "react-colorful";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { 
  CheckCircle, 
  Trophy, 
  RotateCcw, 
  Trash2,
  History,
  Clock,
  Zap
} from "lucide-react";
import { PixelCheck, PixelTower, PixelTrophy, PixelChevronUp, PixelChevronDown } from "~/common/components/ui/pixel-icons";
import { cn } from "~/lib/utils";

// UUID 대신 간단한 ID 생성 함수
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

interface Block {
  x: number;
  y: number;
  color: string;
  date: string;
  saved?: boolean;
}

interface Quest {
  id: string;
  title: string;
  completed: boolean;
  difficulty: "easy" | "medium" | "hard";
  reward: number;
}

interface CalendarEvent {
  event_id: number;
  event_date: string;
  quest_id?: number;
  quest_title?: string;
  blocks_added: number;
  colors_used: string[];
  total_height: number;
}

interface DailyHistory {
  [date: string]: {
    blocks: Block[];
    quests: Quest[];
    completed: boolean;
    totalBricks: number;
  };
}

interface TowerHistoryEntry {
  history_id: number;
  action_type: string;
  created_at: string;
  blocks_changed: number;
  previous_state?: Block[];
  new_state?: Block[];
}

const PIXEL_SIZE = 8;
const GRID_WIDTH = 120;
const GRID_HEIGHT = 80;
const CANVAS_WIDTH = GRID_WIDTH * PIXEL_SIZE;
const CANVAS_HEIGHT = GRID_HEIGHT * PIXEL_SIZE;

const PRESET_COLORS = [
  "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#f1f5f9",
  "#fecaca", "#fde68a", "#bbf7d0", "#bfdbfe", "#ddd6fe",
  "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa",
  "#1e293b", "#881337", "#854d0e", "#14532d", "#1e3a8a",
];

export default function EnhancedBlockStackingGame({ 
  initialBlocks = [], 
  totalBlocks = 20, // Default to 20 bricks
  remainingBlocks = 20, // Default to 20 bricks
  calendarEvents = [], // Calendar events from loader
  overallRankings = [], // Global rankings data
  currentUserId = "" // Current user ID for highlighting
}: {
  initialBlocks?: Block[];
  totalBlocks?: number;
  remainingBlocks?: number;
  calendarEvents?: CalendarEvent[];
  overallRankings?: any[];
  currentUserId?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [currentColor, setCurrentColor] = useState(PRESET_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableBricks, setAvailableBricks] = useState(remainingBlocks);
  const [sessionId] = useState(generateId());
  const [isBuilding, setIsBuilding] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [towerHistory, setTowerHistory] = useState<TowerHistoryEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // 현재 사용자의 랭킹 찾기
  const currentUserRank = overallRankings?.find(
    (player: any) => player.profile_id === currentUserId
  );
  
  // 표시할 랭킹 목록 생성 (상위 10명 + 현재 사용자)
  const displayRankings = () => {
    if (!overallRankings || overallRankings.length === 0) {
      return [];
    }
    
    const top10 = overallRankings.slice(0, 10);
    
    // 현재 사용자가 상위 10명에 있으면 그대로 반환
    if (currentUserRank && top10.some((player: any) => player.profile_id === currentUserRank.profile_id)) {
      return top10;
    }
    
    // 현재 사용자가 상위 10명에 없으면 상위 10명 + 현재 사용자 추가
    if (currentUserRank) {
      return [...top10, currentUserRank];
    }
    
    return top10;
  };
  const [highlightDate, setHighlightDate] = useState<string | undefined>(undefined);
  const [todayQuests, setTodayQuests] = useState<Quest[]>([]);

  // Update available bricks when remainingBlocks prop changes
  useEffect(() => {
    setAvailableBricks(remainingBlocks);
  }, [remainingBlocks]);

  // Initialize blocks from props - 수정된 부분
  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      setBlocks(initialBlocks);
      // remainingBlocks를 사용하여 availableBricks 설정
      setAvailableBricks(remainingBlocks);
    } else {
      // 초기 블록이 없으면 빈 상태로 설정
      setBlocks([]);
      setAvailableBricks(remainingBlocks);
    }
  }, [initialBlocks, remainingBlocks]);

  // Initialize today's quests from calendar events
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEvent = calendarEvents.find(event => event.event_date === today);
    
    if (todayEvent) {
      setTodayQuests([
        {
          id: todayEvent.quest_id?.toString() || '1',
          title: todayEvent.quest_title || 'Daily Quest',
          completed: todayEvent.blocks_added > 0,
          difficulty: 'medium',
          reward: todayEvent.blocks_added
        }
      ]);
    } else {
      setTodayQuests([]);
    }
  }, [calendarEvents]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * PIXEL_SIZE, 0);
      ctx.lineTo(x * PIXEL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * PIXEL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, y * PIXEL_SIZE);
      ctx.stroke();
    }

    // Draw blocks
    blocks.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.fillRect(
        block.x * PIXEL_SIZE,
        block.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    });

    // Draw hover preview
    if (mousePos.x >= 0 && mousePos.y >= 0 && availableBricks > 0) {
      ctx.fillStyle = currentColor + '80';
      ctx.fillRect(
        mousePos.x * PIXEL_SIZE,
        mousePos.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }
  }, [blocks, mousePos, currentColor, availableBricks]);

  // Mouse event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) * scaleY / PIXEL_SIZE);

    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      setMousePos({ x, y });
    } else {
      setMousePos({ x: -1, y: -1 });
    }
  };

  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (availableBricks <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) * scaleY / PIXEL_SIZE);

    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      if (hasSupport(x, y)) {
        const newBlock: Block = {
          x,
          y,
          color: currentColor,
          date: format(new Date(), 'yyyy-MM-dd')
        };

        setBlocks(prev => [...prev, newBlock]);
        setAvailableBricks(prev => prev - 1);
        setIsBuilding(true);
      }
    }
  };

  // Support check function
  const hasSupport = (x: number, y: number): boolean => {
    // Check if position is already occupied
    if (blocks.some(block => block.x === x && block.y === y)) {
      return false;
    }

    // Ground level support
    if (y === GRID_HEIGHT - 1) return true;

    // Support from other blocks
    const hasBlockBelow = blocks.some(block => 
      block.x === x && block.y === y + 1
    );
    const hasBlockLeft = blocks.some(block => 
      block.x === x - 1 && block.y === y
    );
    const hasBlockRight = blocks.some(block => 
      block.x === x + 1 && block.y === y
    );

    return hasBlockBelow || (hasBlockLeft && hasBlockRight);
  };

  // Save blocks to database - 수정된 부분
  const handleSaveBlocks = async () => {
    if (blocks.length === 0) {
      alert('No blocks to save!');
      return;
    }

    const formData = new FormData();
    formData.append("action", "save-blocks");
    formData.append("sessionId", sessionId);
    
    // Save each block individually
    for (const block of blocks) {
      const blockFormData = new FormData();
      blockFormData.append("action", "save-blocks");
      blockFormData.append("sessionId", sessionId);
      blockFormData.append("blockData", JSON.stringify({
        x: block.x,
        y: block.y,
        color: block.color,
        date: block.date
      }));
      
      try {
        const response = await fetch(window.location.href, {
          method: "POST",
          body: blockFormData
        });
        
        if (!response.ok) {
          throw new Error('Failed to save block');
        }
      } catch (error) {
        alert('Failed to save blocks. Please try again.');
        return;
      }
    }
    
    setBlocks(prev => prev.map(b => ({ ...b, saved: true })));
    setIsBuilding(false);
    alert('Blocks saved successfully!');
  };

  // Confirm and permanently save blocks - 수정된 부분
  const handleConfirmBlocks = async () => {
    if (blocks.length === 0) {
      alert('No blocks to confirm!');
      return;
    }

    try {
      // 모든 블록을 한 번에 저장 (배치 처리)
      const allBlockData = blocks.map(block => ({
        x: block.x,
        y: block.y,
        color: block.color,
        date: block.date
      }));

      const batchFormData = new FormData();
      batchFormData.append("action", "save-blocks-batch");
      batchFormData.append("sessionId", sessionId);
      batchFormData.append("blockData", JSON.stringify(allBlockData));
      
      const saveResponse = await fetch(window.location.href, {
        method: "POST",
        body: batchFormData
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save blocks');
      }

      // 잠시 대기 (rate limit 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 그 다음 모든 블록을 확인 상태로 변경
      const confirmFormData = new FormData();
      confirmFormData.append("action", "confirm-blocks");
      confirmFormData.append("sessionId", sessionId);
      
      const confirmResponse = await fetch(window.location.href, {
        method: "POST",
        body: confirmFormData
      });
      
      if (confirmResponse.ok) {
        // 사용자 친화적인 성공 메시지
        const successMessage = `🎉 Tower saved successfully!\n\n📊 Stats:\n• Blocks placed: ${blocks.length}\n• Tower height: ${Math.max(...blocks.map(b => GRID_HEIGHT - b.y), 0)} levels\n\nYour tower has been permanently saved to your profile.`;
        alert(successMessage);
        // 페이지를 리로드하여 저장된 블록들을 표시
        window.location.reload();
      } else {
        throw new Error('Failed to confirm blocks');
      }
    } catch (error) {
      alert('Failed to confirm blocks. Please try again.');
    }
  };

  // Undo last block
  const handleUndo = () => {
    if (blocks.length > 0) {
      setBlocks(prev => prev.slice(0, -1));
      setAvailableBricks(prev => prev + 1);
    }
  };

  // Reset tower - 수정된 부분
  const handleResetTower = async () => {
    if (confirm('Are you sure you want to reset your tower? This action cannot be undone.')) {
      const formData = new FormData();
      formData.append("action", "reset-tower");
      
      try {
        const response = await fetch(window.location.href, {
          method: "POST",
          body: formData
        });
        
        if (response.ok) {
          setBlocks([]);
          setAvailableBricks(totalBlocks);
          setIsBuilding(false);
          alert('Tower reset successfully!');
        } else {
          throw new Error('Failed to reset tower');
        }
      } catch (error) {
        alert('Failed to reset tower. Please try again.');
      }
    }
  };

  // Load tower history - 수정된 부분
  const loadHistory = async () => {
    try {
      const formData = new FormData();
      formData.append("action", "load-history");
      
      const response = await fetch(window.location.href, {
        method: "POST",
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setTowerHistory(data.history || []);
      } else {
        // 임시로 빈 히스토리 설정
        setTowerHistory([]);
      }
    } catch (error) {
      setTowerHistory([]);
    }
    setShowHistory(true);
  };

  // Handle date selection from calendar - 수정된 부분
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      setHighlightDate(dateString);
    } else {
      setHighlightDate(undefined);
    }
  };

  // Get day status for calendar styling - 수정된 부분
  const getDayStatus = (date: string): 'none' | 'perfect' | 'partial' | 'failed' => {
    const dayData = calendarEvents.find(event => event.event_date === date);
    
    if (!dayData) return 'none';
    
    // 퀘스트가 있고 블록이 추가되었으면 'perfect'
    if (dayData.quest_title && dayData.blocks_added > 0) {
      return 'perfect';
    }
    
    // 퀘스트가 있지만 블록이 추가되지 않았으면 'failed'
    if (dayData.quest_title && dayData.blocks_added === 0) {
      return 'failed';
    }
    
    // 퀘스트는 없지만 블록이 추가되었으면 'partial' (예: 수동 배치)
    if (!dayData.quest_title && dayData.blocks_added > 0) {
      return 'partial';
    }
    
    return 'none';
  };

  // Get quest info for selected date - 수정된 부분
  const getSelectedDateQuestInfo = () => {
    if (!highlightDate) return null;
    
    const dayData = calendarEvents.find(event => event.event_date === highlightDate);
    if (!dayData) return null;
    
    // 여러 퀘스트가 있는 경우 처리
    const questTitles = dayData.quest_title ? dayData.quest_title.split(', ') : [];
    const questList = questTitles.map(title => title.trim()).filter(title => title !== 'No quest');
    
    return {
      date: highlightDate,
      questTitle: questList.length > 0 ? questList.join(', ') : 'No quest',
      questList: questList, // 개별 퀘스트 목록
      blocksAdded: dayData.blocks_added || 0,
      status: getDayStatus(highlightDate)
    };
  };

  // Get date class names for calendar styling
  const getDateClassNames = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const status = getDayStatus(dateStr);
    
    const baseClasses = "relative";
    
    switch (status) {
      case 'perfect':
        return `${baseClasses} bg-green-500 text-white hover:bg-green-600`;
      case 'partial':
        return `${baseClasses} bg-orange-500 text-white hover:bg-orange-600`;
      case 'failed':
        return `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
      default:
        return baseClasses;
    }
  };

  // Restore tower from history
  const handleRestore = (historyId: number) => {
    alert('Restore feature not implemented yet');
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Main Game Area */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Build Your Tower</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              {/* Color Picker */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-12 h-12"
                  style={{ backgroundColor: currentColor }}
                />
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 z-10">
                    <HexColorPicker
                      color={currentColor}
                      onChange={setCurrentColor}
                    />
                  </div>
                )}
              </div>

              {/* Preset Colors */}
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={cn(
                      "w-8 h-8 rounded border-2 transition-all",
                      currentColor === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:border-gray-600"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="border rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseMove={handleMouseMove}
                onClick={handleMouseClick}
                className="cursor-pointer pixelated w-full h-full"
                style={{
                  width: "100%",
                  height: "100%",
                  imageRendering: "pixelated",
                }}
              />
              
              {/* Tower Stats - Attached to Canvas Bottom */}
              <div className="flex justify-center gap-8 py-3 px-4 border-t bg-white">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-800">{blocks.length}</div>
                  <div className="text-xs text-blue-600">Blocks Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-800">{availableBricks}</div>
                  <div className="text-xs text-green-600">Available Bricks</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-800">
                    {Math.max(...blocks.map(b => GRID_HEIGHT - b.y), 0)}
                  </div>
                  <div className="text-xs text-purple-600">Tower Height</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleConfirmBlocks}
                disabled={!isBuilding}
                variant="default"
                className="flex items-center gap-2"
              >
                <PixelCheck className="w-4 h-4" />
                Confirm & Save
              </Button>

              <Button
                onClick={handleUndo}
                disabled={blocks.length === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Undo
              </Button>

              <Button
                onClick={handleResetTower}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Reset Tower
              </Button>

              <Button
                onClick={loadHistory}
                variant="outline"
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-4">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Building Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              modifiers={{
                perfect: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  return getDayStatus(dateStr) === 'perfect';
                },
                failed: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  return getDayStatus(dateStr) === 'failed';
                },
                partial: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  return getDayStatus(dateStr) === 'partial';
                }
              }}
              modifiersStyles={{
                perfect: {
                  backgroundColor: '#86efac',
                  color: '#166534',
                  fontWeight: 'bold'
                },
                failed: {
                  backgroundColor: '#fca5a5',
                  color: '#991b1b',
                  fontWeight: 'bold'
                },
                partial: {
                  backgroundColor: '#fed7aa',
                  color: '#92400e',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Perfect day</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Partial day</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Failed day</span>
              </div>
            </div>
            {/* Selected date quest info - 날짜 클릭 시에만 표시 */}
            {selectedDate && getSelectedDateQuestInfo() && (() => {
              const questInfo = getSelectedDateQuestInfo();
              const questList = questInfo?.questList || [];
              
              return (
                <div className="mt-2 text-xs text-gray-400">
                  <div>Date: {format(selectedDate, 'yyyy-MM-dd')}</div>
                  <div>Status: {questInfo?.status}</div>
                  <div>Blocks: {questInfo?.blocksAdded} </div>
                    <div className="font-medium">Quests:</div>
                    {questList.length > 0 ? (
                      questList.map((quest, index) => (
                        <div key={index} className="ml-2">• {quest}</div>
                      ))
                    ) : (
                      <div className="ml-2">• No quests</div>
                    )}
                  </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Daily Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Blocks placed:</span>
              <span className="font-semibold">{blocks.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Tower height:</span>
              <span className="font-semibold">
                {blocks.length > 0 ? Math.max(...blocks.map(b => b.y)) - Math.min(...blocks.map(b => b.y)) + 1 : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Colors used:</span>
              <span className="font-semibold">
                {new Set(blocks.map(b => b.color)).size}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Global Rankings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PixelTrophy className="w-4 h-4 text-yellow-500" />
                Global Rankings
              </CardTitle>
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showLeaderboard ? (
                  <>
                    <PixelChevronUp className="w-3 h-3" />
                    Hide
                  </>
                ) : (
                  <>
                    <PixelChevronDown className="w-3 h-3" />
                    Show
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {showLeaderboard && displayRankings().length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {displayRankings().map((player: any, index: number) => {
                  const isCurrentUser = player.profile_id === currentUserId;
                  const isTop10 = index < 10;
                  
                  return (
                    <div 
                      key={player.profile_id} 
                      className={`flex items-center gap-2 p-1.5 rounded transition-all ${
                        isCurrentUser 
                          ? 'bg-blue-100 border border-blue-300 shadow-sm' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center min-w-[30px]">
                        <div className={`text-sm font-bold ${
                          isCurrentUser ? 'text-blue-600' :
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          index === 2 ? 'text-amber-600' : 'text-gray-600'
                        }`}>
                          #{player.rank}
                        </div>
                        {isCurrentUser && (
                          <div className="text-xs text-blue-500 font-medium">YOU</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}>
                          {player.name?.charAt(0) || player.username?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-xs truncate ${
                            isCurrentUser ? 'text-blue-800 font-semibold' : ''
                          }`}>
                            {player.name || player.username || 'Anonymous'}
                          </div>
                          <div className={`text-xs ${
                            isCurrentUser ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {player.total_bricks} bricks
                          </div>
                        </div>
                      </div>
                      
                      {/* 구분선 (상위 10명과 현재 사용자 사이) */}
                      {!isTop10 && isCurrentUser && (
                        <div className="w-full border-t border-gray-300 my-1 col-span-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
                          ) : !showLeaderboard ? (
                <div className="text-center py-4 text-gray-500">
                  {currentUserRank ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                      <div className="text-xs text-blue-800 font-medium mb-1">Your Ranking</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            #{currentUserRank.rank}
                          </div>
                          <span className="text-xs font-medium">
                            {currentUserRank.name || currentUserRank.username || 'Anonymous'}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600">
                          {currentUserRank.total_bricks} bricks
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg mb-1">
                        <PixelTower className="w-8 h-8 mx-auto" />
                      </div>
                      <div className="text-xs">Click Show to see rankings</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-lg mb-1">
                    <PixelTower className="w-8 h-8 mx-auto" />
                  </div>
                  <div className="text-xs">No rankings yet</div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PixelTower className="w-5 h-5" />
                Tower Building History
              </h3>
              <Button
                onClick={() => setShowHistory(false)}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>
            
            {towerHistory.length > 0 ? (
              <div className="space-y-3">
                {towerHistory.map((entry) => (
                  <div key={entry.history_id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-blue-600">
                        {entry.action_type === 'save' ? '💾 Tower Saved' : 
                         entry.action_type === 'reset' ? '🔄 Tower Reset' : 
                         entry.action_type === 'modify' ? '✏️ Tower Modified' : 
                         entry.action_type}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        📅 {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString()}
                      </div>
                      {entry.blocks_changed > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          🧱 {entry.blocks_changed} blocks changed
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRestore(entry.history_id)}
                      size="sm"
                      variant="outline"
                      className="ml-3"
                    >
                      🔄 Restore
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">
                  <PixelTower className="w-12 h-12 mx-auto" />
                </div>
                <div className="text-lg font-medium mb-2">No History Yet</div>
                <div className="text-sm">Start building your tower to see your history here!</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 