"use client";

import { useRef, useState, useEffect } from "react";
import { Calendar } from "~/common/components/ui/calendar";
import { format } from "date-fns";
import { HexColorPicker } from "react-colorful";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { CheckCircle, Clock, Trophy, Flame, Zap } from "lucide-react";
import { cn } from "~/lib/utils";

interface Block {
  x: number;
  y: number;
  color: string;
  date: string;
}

interface Quest {
  id: string;
  title: string;
  completed: boolean;
  difficulty: "easy" | "medium" | "hard";
  reward: number;
}

interface DailyHistory {
  [date: string]: {
    blocks: Block[];
    quests: Quest[];
    completed: boolean;
    totalBricks: number;
  };
}

const PIXEL_SIZE = 8;
const GRID_WIDTH = 80; // Increased for better fit
const GRID_HEIGHT = 60; // Increased for better fit  
const CANVAS_WIDTH = GRID_WIDTH * PIXEL_SIZE;
const CANVAS_HEIGHT = GRID_HEIGHT * PIXEL_SIZE;

const PRESET_COLORS = [
  "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#f1f5f9",
  "#fecaca", "#fde68a", "#bbf7d0", "#bfdbfe", "#ddd6fe",
  "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa",
  "#1e293b", "#881337", "#854d0e", "#14532d", "#1e3a8a",
];

export default function BlockStackingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentColor, setCurrentColor] = useState(PRESET_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentTodo, setCurrentTodo] = useState("");
  const [dailyHistory, setDailyHistory] = useState<DailyHistory>({});
  const [highlightDate, setHighlightDate] = useState<string | undefined>(undefined);
  const [availableBricks, setAvailableBricks] = useState(20); // Available bricks for building

  // Mock quest data for demonstration
  const mockQuestData: DailyHistory = {
    '2025-01-29': {
      blocks: [],
      quests: [
        { id: '1', title: 'Complete morning workout', completed: true, difficulty: 'medium', reward: 2 },
        { id: '2', title: 'Read 30 pages', completed: true, difficulty: 'easy', reward: 1 },
        { id: '3', title: 'Code for 2 hours', completed: false, difficulty: 'hard', reward: 3 }
      ],
      completed: false,
      totalBricks: 3
    },
    '2025-01-30': {
      blocks: [],
      quests: [
        { id: '4', title: 'Practice meditation', completed: true, difficulty: 'easy', reward: 1 },
        { id: '5', title: 'Complete project milestone', completed: true, difficulty: 'hard', reward: 3 },
        { id: '6', title: 'Call family', completed: true, difficulty: 'easy', reward: 1 }
      ],
      completed: true,
      totalBricks: 5
    }
  };

  // Initialize daily history
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (!dailyHistory[today]) {
      setDailyHistory(prev => ({
        ...prev,
        ...mockQuestData,
        [today]: { blocks: [], quests: [], completed: false, totalBricks: 0 }
      }));
    } else {
      setDailyHistory(prev => ({
        ...mockQuestData,
        ...prev
      }));
    }
  }, []);

  // Draw a single block with lighting
  function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isGhost = false, isHighlighted = false) {
    const baseColor = isGhost ? `${color}80` : color;
    
    // Convert hex to RGB for lighting calculations
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Top-left lighting effect
    const lightIntensity = Math.min(
      1.2, // Max brightness
      0.8 + // Base brightness
      (GRID_HEIGHT - y) * 0.01 + // Vertical gradient
      (GRID_WIDTH - x) * 0.005 // Horizontal gradient
    );
    
    let shadedColor = isGhost
      ? `rgba(${r},${g},${b},0.5)`
      : `rgb(${Math.min(255, r * lightIntensity)},${Math.min(255, g * lightIntensity)},${Math.min(255, b * lightIntensity)})`;

    // Dim blocks from other dates when a date is selected
    if (highlightDate && !isGhost) {
      const blockDate = blocks.find(block => block.x === x && block.y === y)?.date;
      if (blockDate !== highlightDate) {
        shadedColor = `rgba(${r},${g},${b},0.6)`;
      }
    }
    
    ctx.fillStyle = shadedColor;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);

    if (isHighlighted) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }

  // Check if position has support (ground, left, right, below, or above)
  function hasSupport(x: number, y: number): boolean {
    if (y === GRID_HEIGHT - 1) return true; // Ground level
    return blocks.some(block => 
      (block.x === x && block.y === y + 1) || // Below (existing block below)
      (block.x === x && block.y === y - 1) || // Above (can attach to block above)
      (block.y === y && (block.x === x - 1 || block.x === x + 1)) // Left or right
    );
  }

  // Handle mouse movement
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / PIXEL_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / PIXEL_SIZE);
    
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      setMousePos({ x, y });
    }
  }

  // Handle click to place block
  function handleClick() {
    const { x, y } = mousePos;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT && 
        hasSupport(x, y) && 
        !blocks.some(block => block.x === x && block.y === y) &&
        availableBricks > 0) { // Check if bricks are available
      
      const newBlock = {
        x,
        y,
        color: currentColor,
        date: today,
      };
      
      setBlocks(prev => [...prev, newBlock]);
      setAvailableBricks(prev => prev - 1); // Decrease available bricks
      
      // Update daily history
      setDailyHistory(prev => ({
        ...prev,
        [today]: {
          blocks: [...(prev[today]?.blocks || []), newBlock],
          quests: prev[today]?.quests || [],
          completed: prev[today]?.completed || false,
          totalBricks: (prev[today]?.totalBricks || 0) + 1
        }
      }));
    }
  }

  // Main render function
  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid (fainter)
    ctx.strokeStyle = "rgba(226, 232, 240, 0.2)";
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

    // Draw ground with lighting gradient
    const groundGradient = ctx.createLinearGradient(0, (GRID_HEIGHT - 1) * PIXEL_SIZE, CANVAS_WIDTH, (GRID_HEIGHT - 1) * PIXEL_SIZE);
    groundGradient.addColorStop(0, "#f8fafc"); // slate-50 (lighter)
    groundGradient.addColorStop(1, "#f1f5f9"); // slate-100
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, (GRID_HEIGHT - 1) * PIXEL_SIZE, CANVAS_WIDTH, PIXEL_SIZE);

    // Draw existing blocks
    blocks.forEach(block => {
      const isHighlighted = highlightDate ? block.date === highlightDate : false;
      drawBlock(ctx, block.x, block.y, block.color, false, isHighlighted);
    });

    // Draw ghost block at mouse position (only if bricks available)
    if (mousePos.x >= 0 && mousePos.x < GRID_WIDTH && 
        mousePos.y >= 0 && mousePos.y < GRID_HEIGHT &&
        hasSupport(mousePos.x, mousePos.y) &&
        !blocks.some(block => block.x === mousePos.x && block.y === mousePos.y) &&
        availableBricks > 0) {
      drawBlock(ctx, mousePos.x, mousePos.y, currentColor, true);
    }
  }

  // Handle date selection
  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      setHighlightDate(dateStr);
    } else {
      setHighlightDate(undefined);
    }
  }

  // Setup render loop
  useEffect(() => {
    const interval = setInterval(render, 1000 / 60); // 60 FPS
    return () => clearInterval(interval);
  }, [blocks, mousePos, currentColor, highlightDate]);

  const getDayStatus = (date: string) => {
    const dayData = dailyHistory[date];
    if (!dayData || dayData.quests.length === 0) return 'none';
    
    const completedQuests = dayData.quests.filter(q => q.completed).length;
    const totalQuests = dayData.quests.length;
    
    if (completedQuests === totalQuests) return 'perfect';
    if (completedQuests > 0) return 'partial';
    return 'failed';
  };

  const getDateClassNames = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const status = getDayStatus(dateStr);
    
    const baseClasses = "relative";
    
    switch (status) {
      case 'perfect':
        return `${baseClasses} bg-green-500 text-white hover:bg-green-600`;
      case 'partial':
        return `${baseClasses} bg-yellow-500 text-white hover:bg-yellow-600`;
      case 'failed':
        return `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
      default:
        return baseClasses; // Keep default white for no quests
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Building Area */}
      <div className="flex gap-6 items-stretch">
        {/* Left Column - Canvas with Stats */}
        <div className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-3xl font-bold">
                {/* <Trophy className="w-6 h-6 text-yellow-600" /> */}
                Pixel Tower Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6">
              {/* Canvas with Stats - Fill Available Space */}
              <div className="flex-1 rounded-lg overflow-hidden shadow-lg bg-gray-50 border flex flex-col">
                {/* Canvas Area */}
                <div className="flex-1 p-4">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onMouseMove={handleMouseMove}
                    onClick={handleClick}
                    className="cursor-pointer pixelated w-full h-full"
                    style={{
                      width: "100%",
                      height: "100%",
                      imageRendering: "pixelated",
                    }}
                  />
                </div>
                
                {/* Tower Stats - Attached to Canvas Bottom */}
                <div className="flex justify-center gap-8 py-3 px-4 border-t bg-white">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-800">{blocks.length}</div>
                    <div className="text-xs text-blue-600">Total Blocks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-800">{availableBricks}</div>
                    <div className="text-xs text-green-600">Available Bricks</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Color Palette & Calendar */}
        <div className="w-80 flex flex-col space-y-6">
          {/* Color Palette */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Block Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-12 h-12 rounded-lg transition-all border-2 ${
                      currentColor === color 
                        ? "ring-2 ring-blue-400 scale-105 border-blue-300" 
                        : "border-gray-200 hover:scale-105 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  onClick={() => setShowColorPicker(prev => !prev)}
                  className={`w-12 h-12 rounded-lg transition-all border-2 relative ${
                    showColorPicker 
                      ? "ring-2 ring-blue-400 scale-105 border-blue-300" 
                      : "border-gray-200 hover:scale-105 hover:border-gray-300"
                  }`}
                  style={{ 
                    background: "linear-gradient(45deg, #ff0000, #00ff00, #0000ff)",
                  }}
                >
                  <span className="text-white text-sm font-bold">+</span>
                </button>
              </div>
              
              {showColorPicker && (
                <div className="mt-4">
                  <div className="bg-white rounded-lg shadow-xl p-3 border">
                    <HexColorPicker color={currentColor} onChange={setCurrentColor} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar - Flexible Size */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                Quest Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border w-full"
                  classNames={{
                    table: "w-full",
                    head_row: "flex",
                    head_cell: "flex-1 text-center font-normal text-sm text-muted-foreground h-10 flex items-center justify-center",
                    row: "flex w-full mt-1",
                    cell: "flex-1 text-center text-sm p-0 relative h-10 flex items-center justify-center",
                    day: (date: Date) => `h-10 w-full p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground ${getDateClassNames(date)}`,
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daily Quest Detail - Full Width */}
      {selectedDate && highlightDate && dailyHistory[highlightDate] && (
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge 
                  variant={getDayStatus(highlightDate) === 'perfect' ? 'default' : 'secondary'}
                  className={cn(
                    getDayStatus(highlightDate) === 'perfect' && "bg-green-100 text-green-800",
                    getDayStatus(highlightDate) === 'partial' && "bg-yellow-100 text-yellow-800",
                    getDayStatus(highlightDate) === 'failed' && "bg-red-100 text-red-800"
                  )}
                >
                  {getDayStatus(highlightDate) === 'perfect' && '✅ All Complete'}
                  {getDayStatus(highlightDate) === 'partial' && '⚠️ Partial'}
                  {getDayStatus(highlightDate) === 'failed' && '❌ Failed'}
                  {getDayStatus(highlightDate) === 'none' && '⭕ No Quests'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <span className="text-lg">🧱</span>
                  <span>{dailyHistory[highlightDate].totalBricks} bricks</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 mb-2">Daily Quests</h4>
                {dailyHistory[highlightDate].quests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dailyHistory[highlightDate].quests.map(quest => (
                      <div key={quest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {quest.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={cn(
                            "font-medium",
                            quest.completed ? "text-gray-900" : "text-gray-500 line-through"
                          )}>
                            {quest.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            size="sm"
                            className={cn(
                              quest.difficulty === 'easy' && "border-green-200 text-green-700",
                              quest.difficulty === 'medium' && "border-yellow-200 text-yellow-700",
                              quest.difficulty === 'hard' && "border-red-200 text-red-700"
                            )}
                          >
                            {quest.difficulty}
                          </Badge>
                          <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                            <span className="text-xs">🧱</span>
                            <span>{quest.reward}</span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No quests recorded for this day</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 