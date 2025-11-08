import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Calendar } from 'lucide-react';
import './Timeline.css';

export interface Activity {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    elementIds: number[];
    color: string;
}

interface TimelineProps {
    activities: Activity[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
    minDate: Date;
    maxDate: Date;
}

export default function Timeline({
    activities,
    currentDate,
    onDateChange,
    minDate,
    maxDate,
}: TimelineProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const intervalRef = useRef<number | null>(null);

    // Calculate timeline position (0-100%)
    const totalDuration = maxDate.getTime() - minDate.getTime();
    const currentPosition = ((currentDate.getTime() - minDate.getTime()) / totalDuration) * 100;

    // Play/Pause animation
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = window.setInterval(() => {
                const newDate = new Date(currentDate.getTime() + (86400000 * playbackSpeed)); // 1 day * speed
                if (newDate > maxDate) {
                    setIsPlaying(false);
                    onDateChange(maxDate);
                } else {
                    onDateChange(newDate);
                }
            }, 100); // Update every 100ms
        } else {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, playbackSpeed, maxDate, onDateChange, currentDate]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const percentage = parseInt(e.target.value);
        const newDate = new Date(minDate.getTime() + (totalDuration * percentage) / 100);
        onDateChange(newDate);
    };

    const handlePlayPause = () => {
        if (currentDate >= maxDate) {
            onDateChange(minDate); // Reset to start if at end
        }
        setIsPlaying(!isPlaying);
    };

    const skipBackward = () => {
        const newDate = new Date(currentDate.getTime() - 86400000 * 7); // -7 days
        onDateChange(newDate < minDate ? minDate : newDate);
    };

    const skipForward = () => {
        const newDate = new Date(currentDate.getTime() + 86400000 * 7); // +7 days
        onDateChange(newDate > maxDate ? maxDate : newDate);
    };

    // Get active activities at current date
    const activeActivities = activities.filter(
        (activity) =>
            currentDate >= activity.startDate && currentDate <= activity.endDate
    );

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 p-4">
            <div className="max-w-7xl mx-auto space-y-3">
                {/* Date Display and Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-400" />
                        <div>
                            <div className="text-white font-semibold">
                                {currentDate.toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </div>
                            <div className="text-xs text-gray-400">
                                {activeActivities.length} atividade(s) em execução
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={skipBackward}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white"
                            title="Voltar 7 dias"
                        >
                            <SkipBack className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handlePlayPause}
                            className="p-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition text-white"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                            )}
                        </button>

                        <button
                            onClick={skipForward}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white"
                            title="Avançar 7 dias"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>

                        {/* Speed Control */}
                        <select
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                            className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={5}>5x</option>
                            <option value={10}>10x</option>
                        </select>
                    </div>
                </div>

                {/* Timeline Slider */}
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentPosition}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                        style={{
                            background: `linear-gradient(to right, #2563eb ${currentPosition}%, #374151 ${currentPosition}%)`,
                        }}
                    />

                    {/* Activity Bars */}
                    <div className="relative h-12 mt-2 bg-gray-700/50 rounded overflow-hidden">
                        {activities.map((activity) => {
                            const startPercent =
                                ((activity.startDate.getTime() - minDate.getTime()) / totalDuration) * 100;
                            const durationPercent =
                                ((activity.endDate.getTime() - activity.startDate.getTime()) /
                                    totalDuration) *
                                100;

                            return (
                                <div
                                    key={activity.id}
                                    className="absolute top-0 h-full flex items-center px-2 text-xs text-white font-medium overflow-hidden whitespace-nowrap"
                                    style={{
                                        left: `${startPercent}%`,
                                        width: `${durationPercent}%`,
                                        backgroundColor: activity.color,
                                        opacity: activeActivities.includes(activity) ? 1 : 0.5,
                                    }}
                                    title={`${activity.name}\n${activity.startDate.toLocaleDateString()} - ${activity.endDate.toLocaleDateString()}`}
                                >
                                    {activity.name}
                                </div>
                            );
                        })}

                        {/* Current date indicator */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                            style={{ left: `${currentPosition}%` }}
                        />
                    </div>
                </div>

                {/* Active Activities List */}
                {activeActivities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {activeActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="px-3 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-2"
                                style={{ backgroundColor: activity.color }}
                            >
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                {activity.name}
                                <span className="text-white/70">({activity.elementIds.length} elementos)</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
